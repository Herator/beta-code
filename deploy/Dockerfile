FROM alpine:3.20

# Install kubectl, helm, curl, bash
RUN apk add --no-cache curl bash

# kubectl
RUN curl -LO "https://dl.k8s.io/release/$(curl -Ls https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl" \
    && chmod +x kubectl \
    && mv kubectl /usr/local/bin/kubectl

# helm
RUN curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Copy all k8s manifests into the image
COPY k8s/ /k8s/

# Copy deploy script
COPY deploy/deploy.sh /deploy.sh
RUN chmod +x /deploy.sh

ENTRYPOINT ["/deploy.sh"]
