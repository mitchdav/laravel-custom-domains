#!/bin/bash

cd /build

# Update system
yum update -y
yum install -y wget tar xz gzip

# Download and install Go 1.20.5
rm -rf /usr/local/go
wget -q https://go.dev/dl/go1.20.5.linux-amd64.tar.gz -O go.tar.gz
tar -C /usr/local -xzf go.tar.gz
rm go.tar.gz

# Add go to the path
export PATH=$PATH:/usr/local/go/bin
echo 'export PATH=$PATH:/usr/local/go/bin' >> /etc/profile
source /etc/profile

go version

go install -v -n -a github.com/caddyserver/xcaddy/cmd/xcaddy@latest

ls -al .
ls -al /usr/local/go/bin

which xcaddy
#
#~/go/bin/xcaddy build --with $1
