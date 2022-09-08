import { ComponentMeta, ComponentStory } from "@storybook/react";
import VotesTableHeadings from "components/VotesTable/VotesTableHeadings";

export default {
  title: "Pages/Vote Page/VotesTableHeadings",
  component: VotesTableHeadings,
} as ComponentMeta<typeof VotesTableHeadings>;

const Template: ComponentStory<typeof VotesTableHeadings> = (args) => <VotesTableHeadings {...args} />;

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
