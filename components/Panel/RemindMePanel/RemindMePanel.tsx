import { Button, Checkbox, EmailInput, PanelErrorBanner } from "components";
import { mobileAndUnder } from "constant";
import { config } from "helpers";
import Check from "public/assets/icons/check.svg";
import { FormEvent, useState } from "react";
import styled from "styled-components";
import { useMailChimpForm } from "use-mailchimp-form";
import { PanelFooter } from "../PanelFooter";
import { PanelTitle } from "../PanelTitle";
import { PanelSectionText, PanelSectionTitle, PanelWrapper } from "../styles";

export function RemindMePanel() {
  const [email, setEmail] = useState("");
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  const url = config.mailchimpUrl ?? "";

  const { loading, success, message, handleSubmit } = useMailChimpForm(url);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    handleSubmit({ EMAIL: email });
  }

  if (url === "") return null;

  return (
    <PanelWrapper>
      <PanelTitle title="Remind me" />
      <SectionsWrapper>
        <InnerWrapper>
          {success ? (
            <SectionWrapper>
              <SuccessTitle>Success!</SuccessTitle>
              <SuccessDescription>{message}</SuccessDescription>
              <SuccessIconOuterWrapper>
                <SuccessIconWrapper>
                  <SuccessIcon />
                </SuccessIconWrapper>
              </SuccessIconOuterWrapper>
            </SectionWrapper>
          ) : (
            <SectionWrapper>
              <PanelSectionTitle>Email reminder</PanelSectionTitle>
              <PanelSectionText>
                We&apos;ll send out an email 24 hours before the voting commit
                and reveal phases end.
              </PanelSectionText>
              <EmailForm onSubmit={onSubmit}>
                <EmailInput
                  value={email}
                  onInput={setEmail}
                  disabled={loading}
                />
                <CheckboxWrapper>
                  <Checkbox
                    label="I consent to receiving email notifications"
                    checked={disclaimerAccepted}
                    onChange={(e) => setDisclaimerAccepted(e.target.checked)}
                    gap={5}
                  />
                </CheckboxWrapper>
                <SubmitButtonWrapper>
                  <Button
                    variant="primary"
                    type="submit"
                    label="Submit"
                    width="100%"
                    disabled={!disclaimerAccepted || loading}
                  />
                </SubmitButtonWrapper>
              </EmailForm>
            </SectionWrapper>
          )}
          <PanelErrorBanner errorOrigin="remind" />
        </InnerWrapper>
      </SectionsWrapper>
      <PanelFooter />
    </PanelWrapper>
  );
}

const SectionsWrapper = styled.div``;

const SectionWrapper = styled.div`
  padding-inline: 20px;
  padding-block: 20px;
  background: var(--grey-50);
  border-radius: 5px;
`;

const SubmitButtonWrapper = styled.div`
  margin-bottom: 30px;
`;

const EmailForm = styled.form``;

const CheckboxWrapper = styled.div`
  margin-block: 15px;
`;

const SuccessTitle = styled.h2`
  font: var(--text-lg);
  text-align: center;
  margin-bottom: 6px;
`;

const SuccessDescription = styled(PanelSectionText)`
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

const InnerWrapper = styled.div`
  padding-inline: 30px;
  padding-block: 20px;

  @media ${mobileAndUnder} {
    padding-inline: 10px;
  }
`;
