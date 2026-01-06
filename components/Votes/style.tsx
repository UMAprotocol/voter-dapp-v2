import Warning from "public/assets/icons/warning.svg";
import styled from "styled-components";

export const PageSurface = styled.div<{ $darkMode?: boolean }>`
  --surface-bg: ${({ $darkMode }) =>
    $darkMode
      ? "radial-gradient(circle at 10% 20%, rgba(49, 89, 170, 0.15), transparent 35%), radial-gradient(circle at 80% 0%, rgba(124, 58, 237, 0.14), transparent 35%), #0b1020"
      : "transparent"};
  --card-bg: ${({ $darkMode }) =>
    $darkMode
      ? "rgba(255, 255, 255, 0.04)"
      : "linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(240, 242, 245, 0.85))"};
  --card-border: ${({ $darkMode }) =>
    $darkMode ? "rgba(255, 255, 255, 0.08)" : "var(--grey-100)"};
  --text-primary: ${({ $darkMode }) =>
    $darkMode ? "var(--white)" : "var(--black)"};
  --text-muted: ${({ $darkMode }) =>
    $darkMode ? "hsla(0, 0%, 90%, 0.8)" : "var(--black-opacity-75)"};
  --banner-success-bg: ${({ $darkMode }) =>
    $darkMode ? "rgba(12, 166, 87, 0.18)" : "rgba(12, 166, 87, 0.1)"};
  --banner-danger-bg: ${({ $darkMode }) =>
    $darkMode ? "rgba(229, 57, 53, 0.25)" : "rgba(229, 57, 53, 0.18)"};
  --banner-success-border: ${({ $darkMode }) =>
    $darkMode ? "rgba(12, 166, 87, 0.55)" : "rgba(12, 166, 87, 0.35)"};
  --banner-danger-border: ${({ $darkMode }) =>
    $darkMode ? "rgba(229, 57, 53, 0.6)" : "rgba(229, 57, 53, 0.45)"};

  width: 100%;
  padding: clamp(12px, 2vw, 20px);
  background: var(--surface-bg);
  color: var(--text-primary);
  border-radius: 18px;
  transition: background 0.25s ease, color 0.25s ease;
`;

export const VotesTableWrapper = styled.div`
  margin-top: var(--margin-top, 35px);
`;

export const Title = styled.h1`
  font: var(--header-md);
  margin-bottom: 20px;
  color: var(--text-primary);
`;

export const TitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
`;

export const ToggleLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font: var(--text-md);
`;

export const StatusGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  width: 100%;
`;

export const StatusCard = styled.div<{ $darkMode?: boolean }>`
  padding: 14px 16px;
  border-radius: 12px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  box-shadow: ${({ $darkMode }) =>
    $darkMode ? "0px 20px 50px rgba(0, 0, 0, 0.35)" : "0px 8px 22px rgba(0, 0, 0, 0.06)"};

  h4 {
    font: var(--text-sm);
    color: var(--text-muted);
    margin-bottom: 4px;
  }

  strong {
    font: var(--header-sm);
    color: var(--text-primary);
  }
`;

export const StatusBanner = styled.div<{ $type: "success" | "danger" }>`
  width: 100%;
  border-radius: 12px;
  padding: 14px 16px;
  color: ${({ $type }) => ($type === "success" ? "var(--green)" : "var(--red-600)")};
  background: ${({ $type }) =>
    $type === "success" ? "var(--banner-success-bg)" : "var(--banner-danger-bg)"};
  border: 1px solid
    ${({ $type }) =>
      $type === "success" ? "var(--banner-success-border)" : "var(--banner-danger-border)"};
  font: var(--text-md);
`;

export const BannerStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 14px;
`;

export const HelperText = styled.span`
  display: block;
  margin-top: 4px;
  color: var(--text-muted);
  font: var(--text-sm);
`;

export const ButtonOuterWrapper = styled.div`
  margin-top: 30px;
`;

export const ButtonInnerWrapper = styled.div`
  display: flex;
  justify-content: end;
  gap: 15px;

  button {
    text-transform: capitalize;
  }
`;

export const InfoText = styled.p`
  display: flex;
  gap: 15px;
  width: fit-content;
  margin-left: auto;
  margin-bottom: 15px;
  font: var(--text-md);
`;

export const WarningIcon = styled(Warning)`
  path {
    stroke: var(--black);
    fill: transparent;
  }
`;

export const PaginationWrapper = styled.div`
  margin-block: 30px;
`;

export const ButtonSpacer = styled.div`
  width: 10px;
`;

export const Divider = styled.div`
  height: 1px;
  margin-top: 45px;
  margin-bottom: 45px;
  background: ${({ theme }) => theme?.colors?.gray100 ?? "var(--black-opacity-25)"};
`;

export const RecommittingVotesMessage = styled.p`
  width: fit-content;
  font: var(--text-sm);
  margin-left: auto;
  margin-top: 10px;
`;
