import React, { useState, useRef } from "react";
import ClaimEventForm from "./ClaimEventForm";
import ClaimEventList from "./ClaimEventList";
import axios from "axios";
import { Container, Row, Col, FormControl, Form } from "react-bootstrap";
import CKbIcon from "../images/ckb-n.png";
import { context } from "../utils/util";
import useSWR from "swr";
import { useSetState } from "react-use";

const Welcome: React.FC<WelcomeProps> = ({
  claimEvents,
  officialAccount,
  userAccount,
  aggronExplorerHost
}) => {
  const addressHash = useRef("");
  const targetAddress = useRef("");
  const tempClaimEvents = useRef<Array<ClaimEventPresenter>>([]);
  const claimEventPresenters = claimEvents.data.map(event => {
    return event.attributes;
  });
  const [state, setState] = useSetState({
    claimEvents: claimEventPresenters,

    /** The amount(capacity) of CKB from faucet */
    claimAmount: 10000,
    formError: "",
    officialAccount: {
      addressHash: officialAccount.addressHash,
      balance: officialAccount.balance
    },
    userAccount: {
      addressHash: userAccount.addressHash,
      remaining: userAccount.remaining
    },
    onQuery: false
  });

  tempClaimEvents.current = claimEventPresenters;

  const fetchClaimEvents = (url: string) => {
    axios({
      method: "GET",
      url: url,
      params: { address_hash: addressHash.current }
    })
      .then(response => {
        if (addressHash.current != "") {
          setState({
            officialAccount: response.data.officialAccount,
            claimEvents: response.data.claimEvents.data.map(
              (event: ResponseData) => {
                return event.attributes;
              }
            ),
            userAccount: response.data.userAccount
          })
        } else {
          setState({
            officialAccount: response.data.officialAccount,
            claimEvents: response.data.claimEvents.data.map(
              (event: ResponseData) => {
                return event.attributes;
              }
            )
          });
        }
      })
      .catch(error => { });
  };

  useSWR("/claim_events", fetchClaimEvents, { refreshInterval: 5000 })

  const addNewEvent = (claimEvent: ClaimEventPresenter) => {
    const claimEvents = [claimEvent, ...state.claimEvents].sort((a, b) => {
      return +new Date(b.timestamp) - +new Date(a.timestamp);
    });
    setState({
      ...state,
      claimEvents: claimEvents
    });
  };

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (
    event: React.FormEvent<HTMLInputElement>
  ) => {
    setState({ claimAmount: parseInt((event.target as HTMLInputElement).value) })
  };

  const handleInput: React.ChangeEventHandler<HTMLInputElement> = (
    event: React.FormEvent<HTMLInputElement>
  ) => {
    const target = event.target as HTMLInputElement;
    switch (target.name) {
      case "address_hash":
        addressHash.current = target.value;
        setState({ ...state, formError: "" });
        break;
      case "target_address":
        targetAddress.current = target.value;
        if (target.value.trim() === "") {
          clearSearch();
        } else {
          setState({
            ...state
          });
        }
    }

    event.preventDefault();
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    const form = event.currentTarget;
    const addressInput = form.elements[0] as HTMLInputElement;

    if (addressInput.value === "" && addressInput.value.trim().length < 40) {
      setState({ ...state, formError: "Address is invalid." });
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    const csrfObj: HTMLMetaElement | null = document.querySelector(
      "meta[name=csrf-token]"
    );
    const csrfToken = csrfObj ? csrfObj.content : "";
    axios({
      method: "POST",
      url: "/claim_events",
      data: { claim_event: { address_hash: addressHash.current, amount: /* TODO: why the server receives this as a string, not a number? */ state.claimAmount.toString() } },
      headers: {
        "X-CSRF-Token": csrfToken
      }
    })
      .then(response => {
        addNewEvent(response.data.data.attributes);
      })
      .catch(error => {
        setState({
          ...state,
          formError: error.response.data.errors[0]["detail"]
        });
      });

    event.preventDefault();
  };

  const clearSearch = () => {
    targetAddress.current = "";
    setState({
      ...state,
      claimEvents: tempClaimEvents.current,
      onQuery: false
    });
  };

  const handleClear: React.MouseEventHandler = (
    event: React.MouseEvent<HTMLElement>
  ) => {
    clearSearch();
    event.preventDefault();
  };
  const handleQuerySubmit: React.FormEventHandler<HTMLFormElement> = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    const form = event.currentTarget;
    const targetAddressInput = form.elements[0] as HTMLInputElement;
    axios({
      method: "GET",
      url: `/claim_events/${targetAddressInput.value.replace(/[^\w\s]/gi, "")}`
    })
      .then(response => {
        setState({
          ...state,
          onQuery: true,
          claimEvents: response.data.data.map((event: ResponseData) => {
            return event.attributes;
          })
        });
      })
      .catch(error => { });

    event.preventDefault();
  };

  return (
    <context.Provider value={aggronExplorerHost}>
      <>
        <Container className="form-container" fluid>
          <Row className="justify-content-center align-items-center">
            <Col
              className="align-self-center justify-content-center img-container"
            >
              <img src={CKbIcon} alt="" />
            </Col>
          </Row>
          <Row className="justify-content-center align-items-center">
            <Col
              xs="11"
              md="8"
              lg="6"
              xl="5"
              className="justify-content-center content-container"
            >
              <h1>Nervos Pudge Faucet</h1>
            </Col>
          </Row>
          <Row className="justify-content-center align-items-center">
            <Col
              xs="10"
              md="8"
              lg="6"
              xl="5"
              className="justify-content-center content-container"
            >
              <p>Every address can claim a maximum of 300,000 CKB per calendar month.</p>
            </Col>
          </Row>
          <Row className="justify-content-center align-items-center">
            <Col
              xs="10"
              md="8"
              lg="6"
              xl="6"
              className="justify-content-center align-self-center"
              style={{ maxWidth: 918 }}
            >
              <ClaimEventForm
                addressHash={addressHash.current}
                handleChange={handleChange}
                handleInput={handleInput}
                handleSubmit={handleSubmit}
                formError={state.formError}
                remaining={state.userAccount.remaining}
              ></ClaimEventForm>
            </Col>
          </Row>
          <Row className="justify-content-center align-items-center">
            <Col
              xs="10"
              md="8"
              lg="6"
              xl="5"
              className="justify-content-center content-container"
            >
              <p>
                Faucet address balance is{" "}
                {Number(state.officialAccount.balance).toLocaleString("en")}
                &nbsp; CKB
              </p>
            </Col>
          </Row>
        </Container>
        {!state.onQuery && state.claimEvents.length == 0 ? (
          <Container className="d-flex empty-records-container justify-content-center align-items-center fluid">
            <Row>
              <Col xs="12" md="12" lg="10" xl="10">
                <div className="text-center">
                  <h2>No Claims</h2>
                </div>
              </Col>
            </Row>
          </Container>
        ) : (
          <Container className="claim-event-list-container">
            <Row className="justify-content-center align-items-center">
              <Col
                xs="6"
                md="6"
                lg="6"
                xl="6"
                className="d-flex justify-content-start"
              >
                <h2>Claims</h2>
              </Col>
              <Col
                xs="6"
                md="6"
                lg="4"
                xl="4"
                className="d-flex justify-content-end"
              >
                <Form inline onSubmit={handleQuerySubmit}>
                  <FormControl
                    type="text"
                    placeholder="Search Address"
                    className="mr-sm-2"
                    name="target_address"
                    value={targetAddress.current}
                    onChange={handleInput}
                  />
                  <a href="#" onClick={handleClear}>
                    <span
                      id="searchClear"
                      className="far fa-times-circle"
                    ></span>
                  </a>
                </Form>
              </Col>
            </Row>
            {state.claimEvents.length == 0 ? (
              <Container className="d-flex search-empty-records-container justify-content-center align-items-center fluid">
                <Row>
                  <Col xs="12" md="12" lg="10" xl="10">
                    <div className="text-center">
                      <h2>No Claims</h2>
                    </div>
                  </Col>
                </Row>
              </Container>
            ) : (
              <Row className="justify-content-center align-items-center">
                <Col xs="12" md="12" lg="10" xl="10">
                  <ClaimEventList
                    claimEvents={state.claimEvents}
                    aggronExplorerHost={aggronExplorerHost}
                  ></ClaimEventList>
                </Col>
              </Row>
            )}
          </Container>
        )}
      </>
    </context.Provider>
  );
};

export default Welcome;
