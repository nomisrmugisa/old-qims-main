import requests
from flask import Flask, request, Response, json
from flask_cors import CORS
import logging
import urllib3
import os
import resend
from dotenv import load_dotenv
load_dotenv()

# Disable SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Configure CORS
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:5173", "http://127.0.0.1:5173","https://qimsdev.5am.co.bw/main"],
        "methods": ["OPTIONS", "POST", "GET", "PUT", "DELETE"],
        "allow_headers": ["Authorization", "Content-Type", "X-2FA-Code"],
        "supports_credentials": True
    },
    r"/v0.1/*": {
        "origins": ["http://localhost:5173", "http://127.0.0.1:5173"],
        "methods": ["OPTIONS", "POST"],
        "allow_headers": ["Authorization", "Content-Type"],
        "supports_credentials": True
    }
})

# SMS Country API Proxy
# @app.route('/v0.1/Accounts/gCogwZBQKWm6M0G1lUVL/SMSes/', methods=['POST', 'OPTIONS'])
# def send_sms():
#     if request.method == 'OPTIONS':
#         return Response(status=200)

#     try:
#         # Forward the request to SMS Country API
#         sms_country_url = "https://restapi.smscountry.com/v0.1/Accounts/gCogwZBQKWm6M0G1lUVL/SMSes/"
        
#         headers = {
#             'Content-Type': 'application/json',
#             'Authorization': 'Basic Z0NvZ3daQlFLV202TTBHMWxVVkw6czg3d3F0YkIxYUd4aW9PeHNtSllZWGhLSXQwdHIxRFNSaU8xU0pLMg=='
#         }

#         # Get the request data
#         request_data = request.get_json()

#         logger.info(f"Forwarding SMS request to SMS Country API: {request_data}")

#         # Make the request to SMS Country API
#         response = requests.post(
#             sms_country_url,
#             json=request_data,
#             headers=headers,
#             timeout=30
#         )

#         logger.info(f"Received response from SMS Country API: {response.status_code} {response.text}")

#         # Return the response to the client
#         return Response(
#             response.text,
#             status=response.status_code,
#             content_type='application/json'
#         )

#     except requests.exceptions.RequestException as e:
#         logger.error(f"Request error in SMS proxy: {str(e)}", exc_info=True)
#         return Response(
#             json.dumps({"error": f"Request failed: {str(e)}"}),
#             status=500,
#             content_type='application/json'
#         )
#     except Exception as e:
#         logger.error(f"Error in SMS proxy: {str(e)}", exc_info=True)
#         return Response(
#             json.dumps({"error": str(e)}),
#             status=500,
#             content_type='application/json'
#         )

# Email sending endpoint (unchanged)
resend.api_key = os.getenv("RESEND_API_KEY")
@app.route('/api/send-email', methods=['POST', 'OPTIONS'])
def send_email():
    if request.method == 'OPTIONS':
        return Response(status=200)

    try:
        data = request.get_json(force=True)
        recipient = data.get('email')
        username = data.get('username')
        password = data.get('password')

        if not (recipient and username and password):
            return Response(
                json.dumps({"error": "Missing email, username or password."}),
                status=400,
                content_type='application/json'
            )

        FROM_EMAIL = os.getenv("FROM_EMAIL")

        email_response = resend.Emails.send({
            "from": FROM_EMAIL,
            "to": recipient,
            "subject": "Welcome to the Health Facility Licensing Platform",
            "html": f"""
                <p>Hello,</p>
                <p>Your account has been created. Use the credentials below to log in:</p>
                <p><strong>Username:</strong> {username}<br>
                <strong>Password:</strong> {password}</p>
                <p><a href="https://your-app-domain/login">Login Here</a></p>
                <p>Thank you,<br>Ministry of Health, Botswana</p>
            """
        })

        return Response(json.dumps({"message": "Email sent", "res": str(email_response)}), status=200, content_type='application/json')

    except Exception as e:
        logger.error(f"Email sending failed: {str(e)}", exc_info=True)
        return Response(json.dumps({"error": str(e)}), status=500, content_type='application/json')

if __name__ == '__main__':
    app.run(debug=True, port=5002, host='0.0.0.0')