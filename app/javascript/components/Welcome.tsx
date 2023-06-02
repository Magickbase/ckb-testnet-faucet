import React from "react";
import ClaimEventForm from "./ClaimEventForm";
import ClaimEventList from "./ClaimEventList";
import { Container, Row, Col } from "react-bootstrap";
import CKbIcon from "../images/ckb-n.png";
import { serverContext } from "../utils/util";
import { SWRConfig, unstable_serialize } from "swr";
import { useOfficialAccountBalance } from "../hooks/useDataAPI";

const Welcome: React.FC = ({
}) => {
  const { data: officialAccountBalance } = useOfficialAccountBalance();

  return (
    <Container fluid className="p-0 d-flex flex-column align-items-center">
      <Container fluid className="text-light d-flex flex-column form-container align-items-center justify-content-center">
        <img className="logo" src={CKbIcon} alt="CKB Faucet Logo" />
        <h1 className="heading">Nervos Pudge Faucet</h1>
        <div className="desc">Every address can claim a fixed amount of 300,000 CKB in a month. The claimable amount will monthly update on the first day when you claim on this site.</div>
        <ClaimEventForm />
        <p>
          Faucet address balance is{" "}
          {`${Number(officialAccountBalance).toLocaleString("en")} CKB`}
        </p>
      </Container>
      <ClaimEventList />
    </Container>
  );
};

const WithSSRContext = (welcomeProps: WelcomeProps) => {
  welcomeProps.aggronExplorerHost
  return <serverContext.Provider value={{ aggronExplorerHost: welcomeProps.aggronExplorerHost }}>
    <SWRConfig value={{
      [unstable_serialize(['/claim_events', ''])]: welcomeProps,
      ['/claim_events' as string]: welcomeProps
    }} >
      <Welcome />
    </SWRConfig>
  </serverContext.Provider>
}

export default WithSSRContext;
