# Mermaid Error Test

## Valid Mermaid

```mermaid
graph LR
    A --> B
    B --> C
```

## Broken Mermaid (syntax error)

```mermaid
graph LR
    A --> B
    B -->
    C --- ???!!!
```

## Another broken one

```mermaid
sequenceDiagram
    Alice ->> Bob Hello
    Bob -->> Alice ???
    invalid syntax here !!!
```

## Normal content

This is just regular text after the broken mermaid.
