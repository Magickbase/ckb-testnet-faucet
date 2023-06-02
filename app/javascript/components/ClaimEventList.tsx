import React, { useState } from "react";
import ClaimEvent from "./ClaimEvent";
import { FormControl, Row } from "react-bootstrap";
import { useClaimEvents } from "../hooks/useDataAPI";

const ClaimEventList: React.FC = () => {
  const [queryAddress, setQueryAddress] = useState('');
  const { data: claimEvents = [] } = useClaimEvents(queryAddress);

  return (
    <div className="d-flex claim-event-list-container">
      <Row className="justify-content-between heading m-0">
        <h2 className="title">Claims</h2>
        <div>
          <FormControl
            value={queryAddress}
            onChange={e => setQueryAddress((e.target as HTMLInputElement).value)}
            type="search"
            aria-label="Search Address"
            placeholder="Search Address"
            className="query-address"
          />
        </div>
      </Row>
      {claimEvents.length > 0 ? claimEvents?.map(event => <ClaimEvent key={event.id} claimEvent={event} />) : 'No claims'}
    </div>
  );
};

export default ClaimEventList;
