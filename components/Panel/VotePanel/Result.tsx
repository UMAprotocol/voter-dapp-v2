import styled from "styled-components";
import Portion from "public/assets/icons/portion.svg";
import Voting from "public/assets/icons/voting.svg";

export function Result() {
  // todo wire up to graph
  const participationItems = [
    { label: "Total Votes", value: "188,077,355.982231" },
    { label: "Unique Commit Addresses", value: "100" },
    { label: "Unique Reveal Addresses", value: "97" },
  ];

  return (
    <Wrapper>
      <Title>
        <IconWrapper>
          <PortionIcon />
        </IconWrapper>
        Result
      </Title>
      <SectionWrapper></SectionWrapper>
      <Title>
        <IconWrapper>
          <VotingIcon />
        </IconWrapper>
        Participation
      </Title>
      <SectionWrapper>
        {participationItems.map(({ label, value }) => (
          <ParticipationItem key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </ParticipationItem>
        ))}
      </SectionWrapper>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  margin-top: 20px;
  padding-inline: 30px;
`;

const Title = styled.h2`
  display: flex;
  align-items: center;
  justify-content: start;
  gap: 10px;
  margin-bottom: 15px;
  font: var(--header-sm);
  font-weight: 700;
`;

const IconWrapper = styled.div`
  width: 24px;
  height: 24px;
`;

const SectionWrapper = styled.div`
  padding-block: 25px;
  padding-left: 20px;
  padding-right: 12px;
  margin-bottom: 30px;
  background: var(--grey-50);
  border-radius: 5px;
`;

const VotingIcon = styled(Voting)`
  fill: var(--red-500);
`;

const PortionIcon = styled(Portion)`
  fill: var(--red-500);
`;

const ParticipationItem = styled.p`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font: var(--text-md);
  &:not(:last-child) {
    margin-bottom: 20px;
  }
`;
