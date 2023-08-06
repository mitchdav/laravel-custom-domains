FROM --platform=linux/amd64 amazonlinux:latest

RUN mkdir build

# Copies your code file from your action repository to the filesystem path `/` of the container
COPY docker/build-caddy.sh /build/build-caddy.sh

RUN chmod +x /build/build-caddy.sh

ENTRYPOINT ["/build/build-caddy.sh"]