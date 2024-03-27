---
marp: true
---

# CDKTF 101

---

## What is Terraform?

Terraform is an infrastructure as code tool that lets you define both cloud and on-prem resources in human-readable configuration files that you can version, reuse, and share. You can then use a consistent workflow to provision and manage all of your infrastructure throughout its lifecycle.

---

## How does it work?

![](https://developer.hashicorp.com/_next/image?url=https%3A%2F%2Fcontent.hashicorp.com%2Fapi%2Fassets%3Fproduct%3Dterraform%26version%3Drefs%252Fheads%252Fv1.7%26asset%3Dwebsite%252Fimg%252Fdocs%252Fintro-terraform-apis.png%26width%3D2048%26height%3D644&w=2048&q=75)

---

![width:800](https://developer.hashicorp.com/_next/image?url=https%3A%2F%2Fcontent.hashicorp.com%2Fapi%2Fassets%3Fproduct%3Dterraform%26version%3Drefs%252Fheads%252Fv1.7%26asset%3Dwebsite%252Fimg%252Fdocs%252Fintro-terraform-workflow.png%26width%3D2038%26height%3D1773&w=2048&q=75)

---

## Important commands

- `terraform init` - initializes a working directory containing Terraform configuration files
- `terraform validate` - validates the configuration files in a directory, referring only to the configuration and not accessing any remote services such as remote state, provider APIs, etc
- `terraform fmt` - rewrites Terraform configuration files to a canonical format and style

---

- `terraform plan` - creates an execution plan, which lets you preview the changes that Terraform plans to make to your infrastructure. By default, when Terraform creates a plan it:

  - Reads the current state of any already-existing remote objects to make sure that the Terraform state is up-to-date
  - Compares the current configuration to the prior state and noting any differences
  - Proposes a set of change actions that should, if applied, make the remote objects match the configuration

- `terraform apply` - executes the actions proposed in a Terraform plan

- `terraform destroy` - destroys all remote objects managed by a particular Terraform configuration

---

## Let's look at an example

---

## Why HCL?

- **Maturity**: Terraform HCL has been around for a long time and is well-established in the industry.
- **Human-Readable**: HCL is designed to be easy to read and understand
- **Large Community**: There's a vast community of Terraform users and contributors, providing extensive documentation, modules, and support.
- **Declarative Syntax**: HCL are declarative, meaning that they describe the end state of your infrastructure.

---

## What is CDKTF

Cloud Development Kit for Terraform (CDKTF) allows you to use familiar programming languages to define and provision infrastructure.

---

![width:800](https://developer.hashicorp.com/_next/image?url=https%3A%2F%2Fcontent.hashicorp.com%2Fapi%2Fassets%3Fproduct%3Dterraform-cdk%26version%3Dv0.20.5%26asset%3Dwebsite%252Fdocs%252Fcdktf%252Fterraform-platform.png%26width%3D1776%26height%3D1317&w=1920&q=75)

---

## Some important commands

- `cdktf init` - creates a new cdktf project from a template
- `cdktf synth` - synthesizes Terraform configuration for an application. CDKTF stores the synthesized configuration in the cdktf.out directory
- `cdktf provider add/upgrade/list` - adds/upgrades/lists terraform providers
- `cdktf diff` - generates a diff for a given application by running Terraform plan
- `cdktf deploy` - deploys a given application (similar to `terraform apply`)
- `cdktf destroy` - destroy the given stacks

---

## Why CDKTF?

- **Programming Language Support**: CDKTF allows you to use familiar programming languages providing access to powerful language features, libraries, and tooling.
- **High-Level Abstraction**: CDKTF offers a higher-level abstraction over Terraform, allowing you to define reusable constructs.
- **Flexibility**: With CDKTF, you can implement dynamic configurations, conditional logic, and reusable patterns more easily compared to Terraform HCL.
- **Type Safety**

---

## Let's look at an example
