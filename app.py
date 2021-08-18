from flask import Flask, send_from_directory
#from flask_cors import CORS #comment this on deployment
import os


app = Flask(__name__, static_url_path='', static_folder= 'react-flask-app/build')

@app.route("/", defaults={'path':''})
def serve(path):
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == "__main__":
    p = int(os.environ.get("PORT", 5000))
    app.run(debug=True, port=p, host='0.0.0.0')

import api.api