# Helm Chart Generator

Generates Helm chart for Kubernetes deployment of Todo application.

## Version
1.0

## Category
Deployment

## Inputs

| Name | Type | Description | Default |
|-------|------|-------------|----------|
| app_name | string | Application name | `todo-app` |
| values | string | Path to values.yaml | `values.yaml` |

## Outputs

- Chart.yaml
- values.yaml
- templates/ directory with manifests
- README.md

## Instructions

Create Helm chart structure:

1. **Chart Metadata**
   - Chart.yaml with name, version, description
   - AppVersion for application

2. **Values**
   - Image repository and tag
   - Service configuration (port, type)
   - Ingress configuration
   - Resource limits and requests
   - Environment variables

3. **Templates**
   - Deployment (replicas, containers)
   - Service (ClusterIP/NodePort/LoadBalancer)
   - ConfigMap (if needed)
   - Secret (for sensitive data)
   - Ingress (for routing)

4. **Best Practices**
   - Labels and selectors
   - Probes (liveness, readiness)
   - Resource management
   - Health checks

## Example Usage

```
@skills/kubernetes/helm-chart.md
```
