import { Button } from "components/Button";
import { Checkbox } from "components/Checkbox";
import { TextInput } from "components/Input";
import { FormEvent, useState } from "react";
import styled from "styled-components";
import { NotificationButton } from "./NotificationButton";
import Check from "public/assets/icons/check.svg";

export function RemindMePanel() {
  const [email, setEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [notificationButtonClicked, setNotificationButtonClicked] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEmailSubmitted(true);
    console.log(email, "TODO implement submit");
    return false;
  }

  function onNotificationButtonClick() {
    setNotificationButtonClicked(!notificationButtonClicked);
  }

  return (
    <Wrapper>
      {emailSubmitted ? (
        <SectionWrapper>
          <SuccessTitle>Success!</SuccessTitle>
          <SuccessDescription>Your email has been added TODO improve copy</SuccessDescription>
          <SuccessIconOuterWrapper>
            <SuccessIconWrapper>
              <SuccessIcon />
            </SuccessIconWrapper>
          </SuccessIconOuterWrapper>
        </SectionWrapper>
      ) : (
        <SectionWrapper>
          <SectionTitle>Email reminder</SectionTitle>
          <SectionDescription>
            We’ll send out an email 24 hours before the voting commit and reveal phases end.
          </SectionDescription>
          <EmailForm onSubmit={onSubmit}>
            <TextInput placeholder="Your email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <CheckboxWrapper>
              <Checkbox
                label="I consent to receiving email notifications"
                checked={disclaimerAccepted}
                onChange={(e) => setDisclaimerAccepted(e.target.checked)}
                gap={5}
              />
            </CheckboxWrapper>
            <SubmitButtonWrapper>
              <Button variant="primary" type="submit" label="Submit" width="100%" disabled={!disclaimerAccepted} />
            </SubmitButtonWrapper>
          </EmailForm>
        </SectionWrapper>
      )}
      <BrowserReminderSectionWrapper>
        <BrowserReminderTextWrapper>
          <SectionTitle>Browser reminder</SectionTitle>
          <SectionDescription>
            You’ll get notified in the browser 1 hour before the voting commit and reveal phases end.
          </SectionDescription>
        </BrowserReminderTextWrapper>
        <NotificationButton clicked={notificationButtonClicked} onClick={onNotificationButtonClick} />
      </BrowserReminderSectionWrapper>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  margin-top: 20px;
  padding-inline: 25px;
`;

const SectionWrapper = styled.div`
  padding-block: 20px;
  padding-inline: 20px;
  background: var(--grey-50);
  border-radius: 5px;
  margin-bottom: 20px;
`;

const SectionTitle = styled.h2`
  font: var(--header-sm);
  font-weight: 700;
`;

const SectionDescription = styled.p`
  font: var(--text-sm);
  margin-bottom: 20px;
`;

const SubmitButtonWrapper = styled.div`
  margin-bottom: 30px;
`;

const EmailForm = styled.form``;

const CheckboxWrapper = styled.div`
  margin-block: 15px;
`;

const BrowserReminderSectionWrapper = styled(SectionWrapper)`
  display: grid;
  grid-template-columns: 70% 1fr;
  align-items: end;
  justify-items: end;
  padding-bottom: 30px;
`;

const BrowserReminderTextWrapper = styled.div`
  > ${SectionDescription} {
    margin-bottom: 0;
  }
`;

const SuccessTitle = styled.h2`
  font: var(--text-lg);
  text-align: center;
  margin-bottom: 6px;
`;

const SuccessDescription = styled.p`
  font: var(--text-sm);
  text-align: center;
  margin-bottom: 30px;
`;

const SuccessIconWrapper = styled.div`
  width: 16px;
  height: 11px;
`;

const SuccessIconOuterWrapper = styled.div`
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  margin-inline: auto;
  margin-bottom: 38px;
  border-radius: 50%;
  background: var(--white);
`;

const SuccessIcon = styled(Check)`
  path {
    fill: var(--white);
    stroke: var(--green);
  }
`;
