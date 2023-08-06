#!/bin/bash

cd /build

# Update system
echo "Updating dependencies..."
yum update -y
yum install -y wget tar xz gzip which

# Download and install Go 1.20.5
echo "Installing Go..."
rm -rf /usr/local/go
wget -q https://go.dev/dl/go1.20.5.linux-amd64.tar.gz -O go.tar.gz
tar -C /usr/local -xzf go.tar.gz
rm go.tar.gz

# Add go to the path
echo "Adding Go to path..."
export PATH=$PATH:/usr/local/go/bin
echo 'export PATH=$PATH:/usr/local/go/bin' >> /etc/profile
source /etc/profile

echo "Installed Go"
go version

echo "Installing xcaddy..."
GOBIN=/usr/local/go/bin/ go install -v github.com/caddyserver/xcaddy/cmd/xcaddy@latest

echo "Installed xcaddy"
xcaddy version

echo "Building Caddy..."
if [ -n "$1" ];
  then xcaddy build --with $1;
  else xcaddy build;
fi

echo "Built Caddy"
caddy version

ls -al .
