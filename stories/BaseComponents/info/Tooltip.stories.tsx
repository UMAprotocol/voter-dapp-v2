import { ComponentMeta, ComponentStory } from "@storybook/react";
import { Tooltip } from "components";

export default {
  title: "Base Components/Info/Tooltip",
  component: Tooltip,
} as ComponentMeta<typeof Tooltip>;

const Template: ComponentStory<typeof Tooltip> = (args) => (
  <div>
    <Tooltip label={args.label ?? "Dummy text"} aria-label={args["aria-label"] ?? "Dummy text"}>
      {args.children ?? <p>Hover me</p>}
    </Tooltip>
  </div>
);

export const Default = Template.bind({});
