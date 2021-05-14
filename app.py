from flask import Flask, send_from_directory
#from flask_cors import CORS #comment this on deployment
import os

basedir = os.path.abspath(os.path.dirname(__file__))

app = Flask(__name__, static_url_path='', static_folder= os.path.join(basedir, 'react-flask-app/build'))

@app.route("/", defaults={'path':''})
def serve(path):
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == "__main__":
    app.run()
import api.api