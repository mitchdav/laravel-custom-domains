#!/bin/bash

# Update system
yum update -y

# Download and install Go 1.20.5
rm -rf /usr/local/go
wget https://go.dev/dl/go1.20.5.linux-amd64.tar.gz -O go.tar.gz
tar -C /usr/local -xzf go.tar.gz
rm go.tar.gz

# Set the location for go in the environment variables
export GOBIN=/usr/local/go/bin

go install github.com/caddyserver/xcaddy/cmd/xcaddy@latest

go/bin/xcaddy build --with $1
