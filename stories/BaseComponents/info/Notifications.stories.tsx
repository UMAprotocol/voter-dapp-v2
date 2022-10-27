import { Meta, Story } from "@storybook/react";
import { Notifications } from "components";
import { NotificationsProvider } from "contexts";
import { useNotificationsContext } from "hooks";
import { useEffect } from "react";
import { NotificationT } from "types";

interface StoryProps {
  notifications: NotificationT[];
}

export default {
  title: "Base components/Info/Notifications",
  component: Notifications,
  decorators: [
    (Story) => (
      <NotificationsProvider>
        <Story />
      </NotificationsProvider>
    ),
  ],
} as Meta<StoryProps>;

const Template: Story<StoryProps> = ({ notifications }) => {
  const { addNotification } = useNotificationsContext();
  useEffect(() => {
    notifications.forEach((notification) => addNotification(notification.description, notification.transactionHash));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <Notifications />;
};

export const OneNotification = Template.bind({});
OneNotification.args = {
  notifications: [
    {
      description: "Test notification. Committing votes or something",
      transactionHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    },
  ],
};

export const MultipleNotifications = Template.bind({});
MultipleNotifications.args = {
  notifications: [
    {
      description: "Test notification. Committing votes or something",
      transactionHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    },
    {
      description: "Another one. DJ Khaled!",
      transactionHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdee",
    },
  ],
};
