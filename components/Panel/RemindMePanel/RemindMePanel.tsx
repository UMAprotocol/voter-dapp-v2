import { Button } from "components/Button";
import { Checkbox } from "components/Checkbox";
import { TextInput } from "components/Input";
import { FormEvent, useState } from "react";
import styled from "styled-components";
import { NotificationButton } from "./NotificationButton";

export function RemindMePanel() {
  const [email, setEmail] = useState("");
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.log(email, "TODO implement submit");
    return false;
  }

  return (
    <Wrapper>
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
            <Button variant="primary" type="submit" label="Submit" width="100%" />
          </SubmitButtonWrapper>
        </EmailForm>
      </SectionWrapper>
      <SectionWrapper>
        <SectionTitle>Browser reminder</SectionTitle>
        <SectionDescription>
          You’ll get notified in the browser 1 hour before the voting commit and reveal phases end.
        </SectionDescription>
      </SectionWrapper>
      <NotificationButton />
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
  background: var(--gray-50);
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
