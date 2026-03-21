# Mixed Media Test

This document tests media sidebar with mixed content types.

## Section 1: Image

Here's a screenshot:

![Before](assets/screenshot-before.png)

## Section 2: First Video

A short test video:

![Test Video](videos/test-video.mp4)

## Section 3: Another Image

![After](assets/screenshot-after.png)

## Section 3.5: Portrait Screenshots

Smartphone-like tall screenshots:

![Before Portrait](assets/screenshot-before-portrait.png)

![After Portrait](assets/screenshot-after-portrait.png)

## Section 4: Mermaid Diagram

```mermaid
graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Do Something]
    B -->|No| D[Do Nothing]
    C --> E[End]
    D --> E
```

## Section 5: Second Video

A different video to check timeline independence:

![Rainbow Video](videos/video-rainbow.mp4)

## Section 6: Third Video

![Gradient Video](videos/video-gradient.mp4)

## Section 7: Final Image

![Before Again](assets/screenshot-before.png)

## Notes

- Check that each video's timeline shows correct timestamps
- Check that thumbnails in sidebar match the actual content
- Check that arrow key navigation works for video timelines
- Check that video duration matches timeline range
