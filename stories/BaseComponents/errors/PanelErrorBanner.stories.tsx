import { Meta, Story } from "@storybook/react";
import { Button, PanelErrorBanner, TextInput } from "components";
import { desktopPanelWidth } from "constants/containers";
import { PanelError } from "contexts";
import { useErrorContext } from "hooks";
import { ReactNode, useEffect, useState } from "react";

export default {
  title: "Base components/Errors/Panel Error Banner",
  component: PanelErrorBanner,
  decorators: [
    (Story) => (
      <PanelError.Provider>
        <div style={{ width: desktopPanelWidth }}>
          <Story />
        </div>
      </PanelError.Provider>
    ),
  ],
} as Meta<{ errorMessages: ReactNode[] }>;

const Template: Story<{ errorMessages: ReactNode[] }> = (args) => {
  const { errorMessages } = args;
  const { addErrorMessage, removeErrorMessage, clearErrorMessages } = useErrorContext('panel');
  const [errorText, setErrorText] = useState("Test error message");

  useEffect(() => {
    errorMessages.forEach((message) => addErrorMessage(message));
  }, []);

  return (
    <>
      <PanelErrorBanner />
      <div style={{ marginTop: 50 }}>
        <TextInput value={errorText} onInput={setErrorText} />
        <div style={{ display: "grid", width: 200, marginTop: 50, gap: 5 }}>
          <Button onClick={() => addErrorMessage(errorText)} label="Add error from text" variant="primary" />
          <Button onClick={() => removeErrorMessage(errorText)} label="Remove error from text" variant="primary" />
          <Button onClick={clearErrorMessages} label="Clear error messages" variant="primary" />
        </div>
      </div>
    </>
  );
};

export const OneErrorMessage = Template.bind({});
OneErrorMessage.args = {
  errorMessages: ["You seem to be offline. Please check your internet connection and try again."],
};

export const MultipleErrorMessages = Template.bind({});
MultipleErrorMessages.args = {
  errorMessages: [
    "You seem to be offline. Please check your internet connection and try again.",
    "Your wallet is connected to the wrong chain. Please switch to mainnet and try again.",
  ],
};

export const MultipleOfTheSameErrorMessage = Template.bind({});
MultipleOfTheSameErrorMessage.args = {
  errorMessages: [
    "You seem to be offline. Please check your internet connection and try again.",
    "You seem to be offline. Please check your internet connection and try again.",
    "You seem to be offline. Please check your internet connection and try again.",
  ],
};

export const CustomMarkup = Template.bind({});
CustomMarkup.args = {
  errorMessages: [
    <>
      You seem to be offline. <strong>Please check your internet connection and try again.</strong>
    </>,
  ],
};
