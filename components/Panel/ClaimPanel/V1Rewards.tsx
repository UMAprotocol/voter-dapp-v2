import { Button, LoadingSkeleton } from "components";
import { BigNumber } from "ethers";
import { formatNumberForDisplay } from "helpers";
import Bell from "public/assets/icons/bell.svg";
import styled from "styled-components";

interface Props {
  totalRewards: BigNumber;
  onWithdraw: () => void;
  isWithdrawing: boolean;
}
export function V1Rewards({ totalRewards, onWithdraw, isWithdrawing }: Props) {
  return (
    <Wrapper>
      <IconWrapper>
        <BellIcon />
      </IconWrapper>
      <AmountDescriptionWrapper>
        <Amount>
          <Strong>
            {isWithdrawing ? (
              <LoadingSkeleton width={50} />
            ) : (
              formatNumberForDisplay(totalRewards)
            )}
          </Strong>{" "}
          UMA
        </Amount>{" "}
        <Description>from v1 ready to claim</Description>
      </AmountDescriptionWrapper>
      <WithdrawButtonWrapper>
        <Button
          variant="primary"
          label="Claim to wallet"
          onClick={onWithdraw}
          width={150}
          height={35}
        />
      </WithdrawButtonWrapper>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  width: 100%;
  height: 50px;
  display: flex;
  gap: 15px;
  align-items: center;
  padding-left: 15px;
  padding-right: 20px;
  border-radius: 5px;
  background: var(--white);
  font: var(--text-md);
`;

const AmountDescriptionWrapper = styled.span`
  color: var(--black);
`;

const Amount = styled.span``;

const Description = styled.span``;

const IconWrapper = styled.div`
  width: 24px;
  height: 24px;
`;

const BellIcon = styled(Bell)``;

const WithdrawButtonWrapper = styled.div`
  margin-left: auto;
`;

const Strong = styled.strong`
  font-weight: 700;
`;
