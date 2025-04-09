import Polymarket from "public/assets/icons/polymarket.svg";
import { Bulletin } from "web3/queries/getPolymarketBulletins";
import { yellow500 } from "constant";
import styled from "styled-components";
import { addOpacityToHsl } from "helpers";
import { format } from "date-fns";
import Pin from "public/assets/icons/pin.svg";

export const BulletinList = ({ bulletins }: { bulletins: Bulletin[] }) => (
  <BulletinWrapper>
    {bulletins.map((bulletin, index) => (
      <div key={index}>
        <BulletinHeader>
          <LeftSection>
            <ImageWrapper>
              <Polymarket />
            </ImageWrapper>
            <BulletinTitle>Additional context | Polymarket</BulletinTitle>
            <BulletinDate>
              {format(new Date(bulletin.timestamp * 1000), "yyyy-MM-dd HH:mm")}
            </BulletinDate>
          </LeftSection>
          <Pin />
        </BulletinHeader>
        <BulletinText>{bulletin.update}</BulletinText>
        {index < bulletins.length - 1 && <BulletinSeparator />}
      </div>
    ))}
  </BulletinWrapper>
);

const ImageWrapper = styled.div`
  width: 20px;
  height: 20px;
  margin-top: 5px;
  border-radius: 50%;
  background: var(--grey-100);
`;

const BulletinWrapper = styled.div`
  background-color: ${addOpacityToHsl(yellow500, 0.15)};
  border: 1px solid #e9ecef;
  border-radius: 5px;
  padding: 15px;
  margin-bottom: 20px;
`;

const BulletinHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
`;

const BulletinTitle = styled.h4`
  margin: 0;
  margin-left: 10px;
  font-weight: bold;
`;

const BulletinDate = styled.div`
  color: #6c757d;
  margin-left: 10px;
`;

const BulletinText = styled.p`
  margin-top: 10px;
`;

const BulletinSeparator = styled.div`
  height: 10px;
`;
