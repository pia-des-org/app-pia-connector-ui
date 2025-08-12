# FNMT mTLS Implementation

This document describes the implementation of mutual TLS (mTLS) authentication using FNMT certificates for the Segittur application.

## Overview

In order for users to access certain functionalities of Segittur, especially those that have commercial/business impact, such as contract negotiation, users need to prove their right to represent their organization. This is done by presenting the FNMT certificates associated with the organization using mTLS.

## Implementation Details

The implementation consists of the following components:

1. **Certificate Management**: FNMT root and intermediate certificates are stored in the application and used for client certificate validation.
2. **Nginx Configuration**: The nginx server is configured to use mTLS and expose certificate information to the frontend.
3. **Frontend Integration**: A service is created to fetch and use certificate information in the application.

## Setup Instructions

### 1. Obtain FNMT Certificates

Download the required certificates from the FNMT website: https://www.sede.fnmt.gob.es/en/descargas/certificados-raiz-de-la-fnmt

You need:
- Root certificate (AC Raíz FNMT-RCM)
- Intermediate certificate for legal entities (AC Representación)

Convert the certificates from DER to PEM format using OpenSSL:

```bash
openssl x509 -inform der -in fnmt-root.cer -out fnmt-root.pem
openssl x509 -inform der -in fnmt-intermediate.cer -out fnmt-intermediate.pem
```

Place these certificates in the `certs/mtls` directory of the project.

### 2. Generate SSL Certificates for the Server

For HTTPS, you need SSL certificates for the server. In a production environment, you would use certificates from a trusted certificate authority. For development, you can generate self-signed certificates:

#### Option 1: Generate separate certificate and key files
```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout server.key -out server.crt
```

#### Option 2: Generate a PKCS#12 (PFX) file containing both certificate and key
```bash
# First generate the certificate and key
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout server.key -out server.crt

# Then create the PFX file
openssl pkcs12 -export -out server.pfx -inkey server.key -in server.crt -passout pass:
```

The current implementation uses a PFX file for the server's private key. If you have a PFX file, you don't need a separate key file.

Place these certificates in the `certs/mtls` directory of the project.

#### Converting between certificate formats

If you have a PFX file and need to extract the private key:
```bash
openssl pkcs12 -in server.pfx -nocerts -out server.key -nodes
```

If you have a PFX file and need to extract the certificate:
```bash
openssl pkcs12 -in server.pfx -nokeys -out server.crt
```

### 3. Build and Run the Application

#### Prerequisites

Before building the application, ensure you have:
- Node.js and npm installed
- Docker installed
- All required certificates in the `certs/mtls/` directory
- Fixed any TypeScript errors (see "Resolving TypeScript Errors" section)

#### Building the Application

1. Install dependencies:
```bash
npm install
```

2. Build the Docker image:
```bash
docker build -t segittur-app .
```

3. Run the container:
```bash
docker run -p 443:443 -p 80:80 segittur-app
```

#### Verifying the Build

To verify that the application is running correctly:
1. Access the application via HTTPS: https://localhost
2. Check that the HTTPS connection is secure
3. If you have a client certificate installed, the browser should prompt you to select it
4. The application should display your organization name if a valid certificate is present

#### Troubleshooting Build Issues

If you encounter issues during the build:
1. Check that all required files are in the correct locations
2. Verify that the certificates are in the correct format
3. Check the Docker build logs for any errors
4. Ensure that the nginx configuration is correct
5. Verify that the server.pfx file is accessible and not password-protected (or update the configuration to provide the password)

## Testing

Testing mTLS requires:
1. The server must use TLS itself
2. The service must run on the standard HTTPS port (443)
3. The client must have a valid certificate

### Client Test Certificates

Client test certificates can be found at: https://desarrollo.juntadeandalucia.es/node/

You'll need:
- AC Representación/Certificados pruebas Sello de Entidad/FNMT_SELLO_ENTIDAD_NOSMIME.cer
- The associated p12 key from the same folder

Import these into your machine's certificate store:
- On Windows: Double-click the .p12 file and follow the import wizard
- On macOS: Double-click the .p12 file to add it to your Keychain
- On Linux: Use the browser's certificate manager to import the .p12 file

### Verifying mTLS

1. Access the application via HTTPS (https://localhost or your domain)
2. The browser should prompt you to select a certificate
3. After selecting the certificate, the application should display your organization name (if available in the certificate)
4. You can verify the certificate information by checking the browser's developer tools:
   - Make a request to `/me`
   - Check the response headers for `X-Client-CN`

## Troubleshooting

If mTLS is not working:

1. Check that the server is using HTTPS and listening on port 443
2. Verify that the certificates are correctly placed in the Docker image
3. Check the nginx logs for any certificate-related errors
4. Ensure the client certificate is properly imported into your certificate store
5. Some browsers may not prompt for certificates if they don't recognize the certificate authority

## Implementation Details

### Certificate Verification

The implementation uses both the FNMT root certificate and the intermediate certificate for client verification. This is done by:

1. Copying both certificates to the Docker container
2. Creating a combined certificate file that includes both the root and intermediate certificates
3. Configuring nginx to use this combined certificate file for client verification

This approach ensures that certificates issued by the intermediate CA are properly verified.

### Server SSL Configuration

The server uses a self-signed certificate for HTTPS. In the current implementation:

1. The server certificate is stored as `server.crt`
2. The server private key is stored in a PKCS#12 (PFX) file as `server.pfx`
3. Nginx is configured to use these files for SSL

For production, you should replace these with certificates from a trusted certificate authority.

### Docker Configuration

The Dockerfile:
1. Builds the Angular application
2. Sets up an nginx server
3. Copies the FNMT certificates and server SSL certificates
4. Creates a combined certificate file for client verification
5. Sets appropriate permissions on the certificate files

### Nginx Configuration

The nginx configuration:
1. Redirects HTTP to HTTPS
2. Sets up HTTPS with the server certificate and key
3. Configures mTLS with the combined FNMT certificate file
4. Exposes the client certificate information to the frontend through the `/me` endpoint

## Code Structure

- `certs/mtls/`: Contains the FNMT certificates and server SSL certificates
- `deployment/nginx.conf`: Contains the nginx configuration for mTLS
- `src/modules/app/components/services/certificate.service.ts`: Service for handling certificate information
- `src/modules/app/app.component.ts`: Updated to use the certificate service
- `src/modules/app/keycloak-init.factory.ts`: Updated to initialize the certificate service
- `src/modules/app/app.module.ts`: Updated to provide the certificate service

## Resolving TypeScript Errors

When running the TypeScript compiler, you might encounter errors related to missing dependencies. The most common errors are:

1. Cannot find module 'keycloak-angular' or its corresponding type declarations.

To fix this error, install the missing dependency:

```bash
npm install keycloak-angular
```

2. Cannot find module '@think-it-labs/edc-connector-client'

This is a custom package that might not be publicly available. You would need to:
- Obtain the package from the appropriate source
- Install it locally:
  ```bash
  npm install path/to/edc-connector-client
  ```
- Or create a mock implementation if the package is not available

## Security Considerations

- The server's private key should be kept secure and not shared
- In a production environment, use proper certificate management practices
- Consider implementing additional security measures, such as certificate revocation checking
- Regularly update the FNMT certificates when new versions are released
- Implement certificate revocation list (CRL) checking or Online Certificate Status Protocol (OCSP) for production
- Use a proper certificate management system for production deployments
- Ensure that certificates are rotated before they expire
- Monitor for security vulnerabilities in the SSL/TLS implementation
