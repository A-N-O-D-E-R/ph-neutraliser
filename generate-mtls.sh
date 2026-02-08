#!/usr/bin/env bash
set -euo pipefail

# ================== SAFETY CHECK ==================
if [[ "${SPRING_PROFILES_ACTIVE:-dev}" != "dev" ]]; then
  echo "❌ Refusing to generate dev certificates outside DEV profile"
  echo "Set SPRING_PROFILES_ACTIVE=dev to continue"
  exit 1
fi

# ================== CONFIG ==================
DAYS=3650
PASSWORD=changeit

CERT_DIR=certs
SPRING_RESOURCES=src/main/resources

CA_CN="MyDev Root CA"
SERVER_CN="localhost"
CLIENT_CN="mtls-client"

# ================== SETUP ==================
mkdir -p "$CERT_DIR" "$SPRING_RESOURCES"

echo "🧹 Cleaning old certificates..."
rm -f "$CERT_DIR"/*.key \
      "$CERT_DIR"/*.crt \
      "$CERT_DIR"/*.csr \
      "$CERT_DIR"/*.p12 \
      "$CERT_DIR"/*.srl

# ================== CA ==================
echo "🔐 Generating CA..."
openssl genrsa -out "$CERT_DIR/ca.key" 4096

openssl req -x509 -new -nodes \
  -key "$CERT_DIR/ca.key" \
  -sha256 -days $DAYS \
  -out "$CERT_DIR/ca.crt" \
  -subj "/CN=$CA_CN" \
  -addext "basicConstraints=CA:TRUE" \
  -addext "keyUsage=keyCertSign, cRLSign"

# ================== SERVER ==================
echo "🖥 Generating server certificate..."
openssl genrsa -out "$CERT_DIR/server.key" 2048

openssl req -new \
  -key "$CERT_DIR/server.key" \
  -out "$CERT_DIR/server.csr" \
  -subj "/CN=$SERVER_CN"

openssl x509 -req \
  -in "$CERT_DIR/server.csr" \
  -CA "$CERT_DIR/ca.crt" \
  -CAkey "$CERT_DIR/ca.key" \
  -CAcreateserial \
  -out "$CERT_DIR/server.crt" \
  -days $DAYS \
  -sha256 \
  -extfile <(cat <<EOF
subjectAltName=DNS:localhost,IP:127.0.0.1
keyUsage=digitalSignature,keyEncipherment
extendedKeyUsage=serverAuth
EOF
)

openssl pkcs12 -export \
  -in "$CERT_DIR/server.crt" \
  -inkey "$CERT_DIR/server.key" \
  -out "$CERT_DIR/server.p12" \
  -name server \
  -CAfile "$CERT_DIR/ca.crt" \
  -caname root \
  -password pass:$PASSWORD

# ================== TRUSTSTORE ==================
echo "📦 Creating truststore..."
keytool -importcert -noprompt \
  -alias ca \
  -file "$CERT_DIR/ca.crt" \
  -keystore "$CERT_DIR/truststore.p12" \
  -storetype PKCS12 \
  -storepass $PASSWORD

# ================== CLIENT ==================
echo "👤 Generating client certificate..."
openssl genrsa -out "$CERT_DIR/client.key" 2048

openssl req -new \
  -key "$CERT_DIR/client.key" \
  -out "$CERT_DIR/client.csr" \
  -subj "/CN=$CLIENT_CN"

openssl x509 -req \
  -in "$CERT_DIR/client.csr" \
  -CA "$CERT_DIR/ca.crt" \
  -CAkey "$CERT_DIR/ca.key" \
  -CAcreateserial \
  -out "$CERT_DIR/client.crt" \
  -days $DAYS \
  -sha256 \
  -extfile <(cat <<EOF
keyUsage=digitalSignature
extendedKeyUsage=clientAuth
EOF
)

openssl pkcs12 -export \
  -in "$CERT_DIR/client.crt" \
  -inkey "$CERT_DIR/client.key" \
  -out "$CERT_DIR/client.p12" \
  -password pass:$PASSWORD

# ================== COPY TO SPRING ==================
echo "📂 Copying keystores to Spring resources..."
cp "$CERT_DIR/server.p12" "$SPRING_RESOURCES/server.p12"
cp "$CERT_DIR/truststore.p12" "$SPRING_RESOURCES/truststore.p12"

echo ""
echo "✅ mTLS DEV certificates generated"
echo "--------------------------------"
echo "Server keystore : src/main/resources/server.p12"
echo "Truststore      : src/main/resources/truststore.p12"
echo "Client cert     : certs/client.p12"
echo ""
echo "⚠️ DEV ONLY — DO NOT USE IN PRODUCTION"
