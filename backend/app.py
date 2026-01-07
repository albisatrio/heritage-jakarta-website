from flask import Flask, jsonify, request, session
from flask_cors import CORS
import rdflib
from rdflib.namespace import RDF, RDFS, OWL, XSD
from werkzeug.security import check_password_hash, generate_password_hash
import os

app = Flask(__name__)
app.secret_key = 'your_secret_key_here'  # Change this in production
CORS(app, supports_credentials=True)

import os
# Load the graph
g = rdflib.Graph()
try:
    base_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(base_dir, "database.ttl")
    g.parse(db_path, format="turtle")
    print("Graph loaded successfully.")
except Exception as e:
    print(f"Error loading graph: {e}")

# Namespaces
HERITAGE = rdflib.Namespace("http://heritage.jakarta.go.id/resource/")
DBO = rdflib.Namespace("http://dbpedia.org/ontology/")
SCHEMA = rdflib.Namespace("http://schema.org/")

# Admin credentials (in production, use environment variables or database)
ADMIN_USERNAME = 'admin'
ADMIN_PASSWORD_HASH = generate_password_hash('admin123')  # Password: admin123

def save_graph():
    """Save the graph to the TTL file."""
    g.serialize(destination=db_path, format="turtle")
    print("Graph saved successfully.")

def require_admin(f):
    """Decorator to require admin login."""
    def wrapper(*args, **kwargs):
        if 'admin' not in session:
            return jsonify({"error": "Unauthorized"}), 401
        return f(*args, **kwargs)
    wrapper.__name__ = f.__name__
    return wrapper

# Admin credentials (in production, use environment variables or database)
ADMIN_USERNAME = 'admin'
ADMIN_PASSWORD_HASH = generate_password_hash('admin123')  # Password: admin123

@app.route('/api/data', methods=['GET'])
def get_data():
    """
    Returns a list of all events, museums, and historic buildings.
    """
    query = """
    PREFIX : <http://heritage.jakarta.go.id/resource/>
    PREFIX dbo: <http://dbpedia.org/ontology/>
    PREFIX schema: <http://schema.org/>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    
    SELECT ?subject ?type ?comment ?address
    WHERE {
        ?subject rdf:type ?type .
        OPTIONAL { ?subject rdfs:comment ?comment } .
        OPTIONAL { ?subject schema:address ?address } .
        FILTER (?type IN (dbo:Event, dbo:HistoricBuilding, dbo:Museum, schema:Event, schema:LandmarksOrHistoricalBuildings, schema:Museum))
    }
    """
    
    items = {}
    
    for row in g.query(query):
        subject = str(row.subject)
        if subject not in items:
            # Extract a readable name from the URI
            local_name = subject.split("/")[-1]
            readable_name = local_name.replace("_", " ")
            
            items[subject] = {
                "id": local_name, # Send local name as ID for easier routing
                "uri": subject,
                "name": readable_name,
                "types": [],
                "description": "",
                "address": ""
            }
        
        if row.type:
            items[subject]["types"].append(str(row.type).split("/")[-1])
        if row.comment:
            items[subject]["description"] = str(row.comment)
        if row.address:
            items[subject]["address"] = str(row.address)
            
    return jsonify(list(items.values()))

@app.route('/api/data/<path:resource_id>', methods=['GET'])
def get_detail(resource_id):
    """
    Returns details for a specific resource.
    """
    uri = HERITAGE[resource_id]
    
    # Check if the resource exists in the graph
    if (uri, None, None) not in g:
        return jsonify({"error": "Resource not found"}), 404
    
    data = {
        "id": resource_id,
        "uri": str(uri),
        "properties": {}
    }
    
    # Get all properties
    for p, o in g.predicate_objects(subject=uri):
        pred_str = str(p)
        obj_str = str(o)
        
        # Simplify predicate names for frontend if needed, or keep full URIs
        # Here we'll just group by predicate
        if pred_str not in data["properties"]:
            data["properties"][pred_str] = []
        
        data["properties"][pred_str].append(obj_str)
        
        # Add some convenience fields at top level
        if p == RDFS.comment:
            data["description"] = obj_str
        if p == SCHEMA.address:
            data["address"] = obj_str
        if p == RDF.type:
             if "types" not in data:
                 data["types"] = []
             data["types"].append(obj_str.split("/")[-1])

    # Fallback name
    data["name"] = resource_id.replace("_", " ")

    return jsonify(data)

@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if username == ADMIN_USERNAME and check_password_hash(ADMIN_PASSWORD_HASH, password):
        session['admin'] = True
        return jsonify({"message": "Login successful"})
    else:
        return jsonify({"error": "Invalid credentials"}), 401

@app.route('/api/admin/logout', methods=['POST'])
def admin_logout():
    session.pop('admin', None)
    return jsonify({"message": "Logout successful"})

@app.route('/api/admin/events', methods=['GET'])
@require_admin
def get_admin_events():
    """Get all events for admin."""
    query = """
    PREFIX : <http://heritage.jakarta.go.id/resource/>
    PREFIX dbo: <http://dbpedia.org/ontology/>
    PREFIX schema: <http://schema.org/>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    
    SELECT ?subject ?type ?comment ?address
    WHERE {
        ?subject rdf:type ?type .
        OPTIONAL { ?subject rdfs:comment ?comment } .
        OPTIONAL { ?subject schema:address ?address } .
        FILTER (?type IN (dbo:Event, dbo:HistoricBuilding, dbo:Museum, schema:Event, schema:LandmarksOrHistoricalBuildings, schema:Museum))
    }
    """
    
    events = []
    for row in g.query(query):
        subject = str(row.subject)
        local_name = subject.split("/")[-1]
        events.append({
            "id": local_name,
            "uri": subject,
            "type": str(row.type).split("/")[-1],
            "name": local_name.replace("_", " "),
            "description": str(row.comment) if row.comment else "",
            "address": str(row.address) if row.address else ""
        })
    
    return jsonify(events)

@app.route('/api/admin/events', methods=['POST'])
@require_admin
def add_event():
    data = request.get_json()
    name = data.get('name')
    type_name = data.get('type', 'Event')
    description = data.get('description', '')
    address = data.get('address', '')
    
    if not name:
        return jsonify({"error": "Name is required"}), 400
    
    # Map type_name to URIs
    type_map = {
        'Event': DBO.Event,
        'Museum': DBO.Museum,
        'HistoricBuilding': DBO.HistoricBuilding,
        'LandmarksOrHistoricalBuildings': SCHEMA.LandmarksOrHistoricalBuildings
    }
    rdf_type = type_map.get(type_name, DBO.Event)
    
    # Create URI
    resource_id = name.replace(" ", "_")
    uri = HERITAGE[resource_id]
    
    # Check if already exists
    if (uri, RDF.type, rdf_type) in g:
        return jsonify({"error": "Resource already exists"}), 400
    
    # Add triples
    g.add((uri, RDF.type, rdf_type))
    if description:
        g.add((uri, RDFS.comment, rdflib.Literal(description)))
    if address:
        g.add((uri, SCHEMA.address, rdflib.Literal(address)))
    
    save_graph()
    return jsonify({"message": "Event added successfully", "id": resource_id})

@app.route('/api/admin/events/<path:resource_id>', methods=['DELETE'])
@require_admin
def delete_event(resource_id):
    uri = HERITAGE[resource_id]
    
    # Check if exists (any of our tracked types)
    possible_types = [DBO.Event, DBO.Museum, DBO.HistoricBuilding, SCHEMA.LandmarksOrHistoricalBuildings, SCHEMA.Museum, SCHEMA.Event]
    is_found = False
    for t in possible_types:
        if (uri, RDF.type, t) in g:
            is_found = True
            break
            
    if not is_found:
        return jsonify({"error": "Resource not found"}), 404
    
    # Remove all triples for this event
    triples_to_remove = list(g.triples((uri, None, None)))
    for triple in triples_to_remove:
        g.remove(triple)
    
    save_graph()
    return jsonify({"message": "Event deleted successfully"})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
