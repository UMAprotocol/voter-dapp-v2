import { ComponentMeta, ComponentStory } from "@storybook/react";
import { Nav } from "components";

export default {
  title: "Base components",
  component: Nav,
  decorators: [
    (Story) => (
      <div style={{ width: 500 }}>
        <Story />
      </div>
    ),
  ],
} as ComponentMeta<typeof Nav>;

const Template: ComponentStory<typeof Nav> = (args) => <Nav {...args} />;

export const Default = Template.bind({});
Default.args = {
  links: [
    {
      title: "Vote",
      href: "/",
    },
    {
      title: "Settled Disputes & Votes",
      href: "/settled",
    },
    {
      title: "Two Key Voting",
      href: "/two-key",
    },
    {
      title: "Optimistic Oracle",
      href: "https://oracle.umaproject.org",
    },
    {
      title: "Docs",
      href: "https://docs.umaproject.org",
    },
  ],
};
Default.parameters = {
  layout: "centered",
  backgrounds: {
    default: "dark",
  },
};
