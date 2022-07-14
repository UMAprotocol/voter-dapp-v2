import { Button } from "components/Button";
import { Checkbox } from "components/Checkbox";
import { TextInput } from "components/Input";
import { useState } from "react";
import styled from "styled-components";

export function RemindMePanel() {
  const [email, setEmail] = useState("");
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  return (
    <Wrapper>
      <SectionWrapper>
        <SectionTitle>Email reminder</SectionTitle>
        <SectionDescription>
          We’ll send out an email 24 hours before the voting commit and reveal phases end.
        </SectionDescription>
        <TextInput placeholder="Your email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Checkbox
          label="I consent to receiving email notifications"
          checked={disclaimerAccepted}
          onChange={(e) => setDisclaimerAccepted(e.target.checked)}
        />
        <SubmitButtonWrapper>
          <Button label="Submit" />
        </SubmitButtonWrapper>
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

function NotificationButton() {
  return <div></div>;
}

const Wrapper = styled.div``;

const SectionWrapper = styled.div``;

const SectionTitle = styled.h2``;

const SectionDescription = styled.p``;

const SubmitButtonWrapper = styled.div``;
