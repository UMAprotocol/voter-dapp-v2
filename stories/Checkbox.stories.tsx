import { ComponentMeta, ComponentStory } from "@storybook/react";
import { Checkbox } from "components/Checkbox";

export default {
  title: "Checkbox",
  component: Checkbox,
} as ComponentMeta<typeof Checkbox>;

const Template: ComponentStory<typeof Checkbox> = () => <Checkbox />;
