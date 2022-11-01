import { Meta, Story } from "@storybook/react";
import { Notifications } from "components";
import { defaultNotificationsContextState, NotificationsContext } from "contexts";
import { NotificationsByUuid } from "contexts/NotificationsContext";
import uuid from "react-uuid";

interface StoryProps {
  notifications: NotificationsByUuid;
}

export default {
  title: "Base components/Info/Notifications",
  component: Notifications,
} as Meta<StoryProps>;

const Template: Story<StoryProps> = ({ notifications }) => {
  const mockNotificationsContextState = {
    ...defaultNotificationsContextState,
    notifications,
  };
  return (
    <NotificationsContext.Provider value={mockNotificationsContextState}>
      <Notifications />
    </NotificationsContext.Provider>
  );
};

const [mockId1, mockId2, mockId3] = Array.from({ length: 3 }, () => uuid());

export const OneNotification = Template.bind({});
OneNotification.args = {
  notifications: {
    [mockId1]: {
      message: "Test notification. Committing votes or something",
      transactionHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      type: "pending",
      id: mockId1,
    },
  },
};

export const MultipleNotifications = Template.bind({});
MultipleNotifications.args = {
  notifications: {
    [mockId1]: {
      message: "Test notification. Committing votes or something",
      transactionHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      type: "pending",
      id: mockId1,
    },
    [mockId2]: {
      message: "Testing testing one two three",
      transactionHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdea",
      type: "error",
      id: mockId2,
    },
    [mockId3]: {
      message: "Another one. DJ Khaled!",
      transactionHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdee",
      type: "success",
      id: mockId3,
    },
  },
};
