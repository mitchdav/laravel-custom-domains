FROM amazonlinux:latest

ARG MODULE

# Copies your code file from your action repository to the filesystem path `/` of the container
COPY build-caddy.sh /build-caddy.sh

# Code file to execute when the docker container starts up
ENTRYPOINT ["/build-caddy.sh", "${MODULE}"]