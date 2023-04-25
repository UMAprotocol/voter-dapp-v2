import { ComponentMeta, ComponentStory } from "@storybook/react";
import { VoteTableHeadings } from "components";

export default {
  title: "Pages/Vote Page/VoteTableHeadings",
  component: VoteTableHeadings,
} as ComponentMeta<typeof VoteTableHeadings>;

const Template: ComponentStory<typeof VoteTableHeadings> = (args) => (
  <VoteTableHeadings {...args} />
);

export const Active = Template.bind({});
Active.args = {
  activityStatus: "active",
};

export const Upcoming = Template.bind({});
Upcoming.args = {
  activityStatus: "upcoming",
};

export const Past = Template.bind({});
Past.args = {
  activityStatus: "past",
};
