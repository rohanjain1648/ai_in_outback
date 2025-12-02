#!/bin/bash

# SSL Certificate Setup Script for Rural Connect AI
# Supports Let's Encrypt certificates and self-signed certificates for development

set -e

# Configuration
DOMAIN=${1:-localhost}
EMAIL=${2:-admin@ruralconnect.ai}
ENVIRONMENT=${3:-development}
SSL_DIR="$(pwd)/ssl"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Create SSL directory
create_ssl_directory() {
    log_info "Creating SSL directory..."
    mkdir -p "$SSL_DIR"
    log_success "SSL directory created: $SSL_DIR"
}

# Generate self-signed certificate for development
generate_self_signed_cert() {
    log_info "Generating self-signed certificate for $DOMAIN..."
    
    # Generate private key
    openssl genrsa -out "$SSL_DIR/private.key" 2048
    
    # Generate certificate signing request
    openssl req -new -key "$SSL_DIR/private.key" -out "$SSL_DIR/cert.csr" -subj "/C=AU/ST=NSW/L=Sydney/O=Rural Connect AI/CN=$DOMAIN"
    
    # Generate self-signed certificate
    openssl x509 -req -days 365 -in "$SSL_DIR/cert.csr" -signkey "$SSL_DIR/private.key" -out "$SSL_DIR/certificate.crt"
    
    # Create combined certificate file
    cat "$SSL_DIR/certificate.crt" > "$SSL_DIR/fullchain.pem"
    cp "$SSL_DIR/private.key" "$SSL_DIR/privkey.pem"
    
    # Set proper permissions
    chmod 600 "$SSL_DIR/private.key" "$SSL_DIR/privkey.pem"
    chmod 644 "$SSL_DIR/certificate.crt" "$SSL_DIR/fullchain.pem"
    
    log_success "Self-signed certificate generated successfully"
}

# Generate Let's Encrypt certificate for production
generate_letsencrypt_cert() {
    log_info "Generating Let's Encrypt certificate for $DOMAIN..."
    
    # Check if certbot is installed
    if ! command -v certbot &> /dev/null; then
        log_error "Certbot is not installed. Please install it first."
        log_info "Ubuntu/Debian: sudo apt-get install certbot"
        log_info "CentOS/RHEL: sudo yum install certbot"
        log_info "macOS: brew install certbot"
        exit 1
    fi
    
    # Generate certificate using standalone mode
    certbot certonly \
        --standalone \
        --non-interactive \
        --agree-tos \
        --email "$EMAIL" \
        -d "$DOMAIN" \
        --cert-path "$SSL_DIR/certificate.crt" \
        --key-path "$SSL_DIR/private.key" \
        --fullchain-path "$SSL_DIR/fullchain.pem" \
        --chain-path "$SSL_DIR/chain.pem"
    
    # Copy certificates to our SSL directory
    cp "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" "$SSL_DIR/"
    cp "/etc/letsencrypt/live/$DOMAIN/privkey.pem" "$SSL_DIR/"
    cp "/etc/letsencrypt/live/$DOMAIN/cert.pem" "$SSL_DIR/certificate.crt"
    cp "/etc/letsencrypt/live/$DOMAIN/chain.pem" "$SSL_DIR/"
    
    # Set proper permissions
    chmod 600 "$SSL_DIR/privkey.pem"
    chmod 644 "$SSL_DIR/fullchain.pem" "$SSL_DIR/certificate.crt" "$SSL_DIR/chain.pem"
    
    log_success "Let's Encrypt certificate generated successfully"
}

# Setup certificate renewal for Let's Encrypt
setup_cert_renewal() {
    log_info "Setting up automatic certificate renewal..."
    
    # Create renewal script
    cat > "$SSL_DIR/renew-cert.sh" << 'EOF'
#!/bin/bash
certbot renew --quiet --no-self-upgrade
if [ $? -eq 0 ]; then
    # Copy renewed certificates
    cp "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" "$SSL_DIR/"
    cp "/etc/letsencrypt/live/$DOMAIN/privkey.pem" "$SSL_DIR/"
    cp "/etc/letsencrypt/live/$DOMAIN/cert.pem" "$SSL_DIR/certificate.crt"
    cp "/etc/letsencrypt/live/$DOMAIN/chain.pem" "$SSL_DIR/"
    
    # Restart nginx to use new certificates
    docker-compose restart nginx-lb
fi
EOF
    
    chmod +x "$SSL_DIR/renew-cert.sh"
    
    # Add to crontab (runs twice daily)
    (crontab -l 2>/dev/null; echo "0 */12 * * * $SSL_DIR/renew-cert.sh") | crontab -
    
    log_success "Certificate renewal setup completed"
}

# Validate certificate
validate_certificate() {
    log_info "Validating SSL certificate..."
    
    if [[ -f "$SSL_DIR/fullchain.pem" && -f "$SSL_DIR/privkey.pem" ]]; then
        # Check certificate validity
        openssl x509 -in "$SSL_DIR/fullchain.pem" -text -noout > /dev/null
        
        if [[ $? -eq 0 ]]; then
            log_success "Certificate validation passed"
            
            # Display certificate information
            log_info "Certificate information:"
            openssl x509 -in "$SSL_DIR/fullchain.pem" -text -noout | grep -E "(Subject:|Issuer:|Not Before:|Not After:)"
        else
            log_error "Certificate validation failed"
            exit 1
        fi
    else
        log_error "Certificate files not found"
        exit 1
    fi
}

# Generate Diffie-Hellman parameters for enhanced security
generate_dhparam() {
    log_info "Generating Diffie-Hellman parameters (this may take a while)..."
    
    if [[ ! -f "$SSL_DIR/dhparam.pem" ]]; then
        openssl dhparam -out "$SSL_DIR/dhparam.pem" 2048
        chmod 644 "$SSL_DIR/dhparam.pem"
        log_success "Diffie-Hellman parameters generated"
    else
        log_info "Diffie-Hellman parameters already exist"
    fi
}

# Create nginx SSL configuration
create_nginx_ssl_config() {
    log_info "Creating nginx SSL configuration..."
    
    cat > "nginx-ssl.conf" << EOF
# SSL Configuration for Rural Connect AI

server {
    listen 80;
    server_name $DOMAIN;
    
    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN;
    
    # SSL Configuration
    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    ssl_dhparam /etc/nginx/ssl/dhparam.pem;
    
    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_session_tickets off;
    
    # HSTS (HTTP Strict Transport Security)
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    ssl_trusted_certificate /etc/nginx/ssl/chain.pem;
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;
    
    # Proxy to frontend
    location / {
        proxy_pass http://frontend:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
    
    log_success "Nginx SSL configuration created"
}

# Main function
main() {
    log_info "Setting up SSL certificates for Rural Connect AI"
    log_info "Domain: $DOMAIN"
    log_info "Environment: $ENVIRONMENT"
    
    create_ssl_directory
    
    case $ENVIRONMENT in
        development|dev)
            generate_self_signed_cert
            ;;
        staging|production|prod)
            generate_letsencrypt_cert
            setup_cert_renewal
            ;;
        *)
            log_error "Invalid environment: $ENVIRONMENT"
            log_info "Valid environments: development, staging, production"
            exit 1
            ;;
    esac
    
    generate_dhparam
    validate_certificate
    create_nginx_ssl_config
    
    log_success "SSL setup completed successfully!"
    log_info "Certificate files are located in: $SSL_DIR"
    log_info "Nginx SSL configuration: nginx-ssl.conf"
}

# Handle script interruption
trap 'log_error "SSL setup interrupted"; exit 1' INT TERM

# Show usage if no arguments provided
if [[ $# -eq 0 ]]; then
    echo "Usage: $0 <domain> [email] [environment]"
    echo "Example: $0 ruralconnect.ai admin@ruralconnect.ai production"
    echo "Example: $0 localhost admin@localhost.com development"
    exit 1
fi

# Run main function
main "$@"