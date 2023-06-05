import React, { useEffect, useRef } from "react";
import { Button, Form, Col, Row } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleQuestion } from "@fortawesome/free-solid-svg-icons";
import Tooltip from "react-bootstrap/Tooltip";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import {
  useClaimEvents,
  useUserAddressRemaining,
} from "../hooks/useDataAPI";

type FormState = {
  addressHash: string;
  amount: string;
};

const ClaimEventForm: React.FC = ({ }) => {
  const { mutate: freshClaimEvents } = useClaimEvents();
  const addressHashRef = useRef<string>();
  const remainingRef = useRef<number | null | undefined>();

  const validationSchema = Yup.object().shape({
    addressHash: Yup.string()
      .trim()
      .min(40, "Invalid address")
      .matches(/ckt/, "Invalid address")
      .test(
        "remaining",
        "The amount you claimed cannot be greater than your remaining.",
        (addressHash) => {
          const remaining = remainingRef.current;

          return (
            !addressHash || !(typeof remaining === "number") || remaining > 0
          );
        }
      ),
  });
  const {
    handleSubmit,
    values,
    handleChange,
    errors,
    isSubmitting,
    validateField,
    setFieldError,
  } = useFormik<FormState>({
    initialValues: {
      addressHash: "",
      amount: "10000",
    },
    validationSchema,
    async onSubmit(values, { resetForm }) {
      const csrfObj: HTMLMetaElement | null = document.querySelector(
        "meta[name=csrf-token]"
      );
      const csrfToken = csrfObj ? csrfObj.content : "";
      try {
        await axios({
          method: "POST",
          url: "/claim_events",
          data: {
            claim_event: {
              address_hash: values.addressHash,
              amount: values.amount.toString(),
            },
          },
          headers: {
            "X-CSRF-Token": csrfToken,
          },
        });
      } catch (e) {
        const errorDetail: string | undefined = e?.response?.data?.errors?.[0]["detail"];
        errorDetail && setFieldError('addressHash', errorDetail);
        return;
      }
      resetForm({ values: { amount: '10000', addressHash: values.addressHash } });
      freshClaimEvents();
      freshRemaining();
    },
  });

  const { data: remaining, mutate: freshRemaining } = useUserAddressRemaining(values.addressHash);
  addressHashRef.current = values.addressHash;
  remainingRef.current = remaining;
  useEffect(() => {
    typeof remaining === "number" && validateField("addressHash");
  }, [remaining]);

  return (
    <Form className="claim-form d-flex flex-column" onSubmit={handleSubmit}>
      <Form.Group
        className="d-flex mb-0 address-hash-container"
        controlId="addressHash"
      >
        <Form.Label>To address</Form.Label>
        <div className="d-flex flex-column flex-grow-1">
          <Form.Control
            name="addressHash"
            type="input"
            value={values.addressHash}
            onChange={handleChange}
            placeholder="Enter your Pudge wallet address"
            autoFocus
            isInvalid={!!errors.addressHash}
          />
          <Form.Control.Feedback type="invalid">
            {errors.addressHash}
          </Form.Control.Feedback>
        </div>
      </Form.Group>
      <Row className="m-0">
        {!!values.addressHash &&
          !errors.addressHash &&
          (
            <Form.Group controlId="amount" className="amount-container d-flex">
              <Form.Label className="text-light">
                <Col className="p-0">Amount</Col>
                <Col className="remaining-container-sm flex-grow-0 align-items-center">
                  {`Remaining: ${Number(remaining).toLocaleString("en")} `}
                  <OverlayTrigger
                    overlay={
                      <Tooltip className="ml-4" id="remaining-tooltip">
                        Your claimable amount now for this month is{" "}
                        {remaining != null &&
                          Number(remaining).toLocaleString("en")}{" "}
                        CKB.
                      </Tooltip>
                    }
                  >
                    <FontAwesomeIcon icon={faCircleQuestion} />
                  </OverlayTrigger>
                </Col>
              </Form.Label>
              <Col className="d-flex flex-grow-1 p-0 justify-content-between radio-items">
                {[10_000, 100_000, 300_000].map((amount) => (
                  <Form.Check
                    key={amount}
                    disabled={amount > remaining!}
                    type="radio"
                    inline
                    label={Number(amount).toLocaleString('en')}
                    value={amount.toString()}
                    name="amount"
                    checked={values.amount === amount.toString()}
                    onChange={handleChange}
                    id={`amount-${amount}`}
                  />
                ))}
              </Col>
              <Col className="remaining-container flex-grow-0 align-items-center pl-16">
                {`Remaining: ${Number(remaining).toLocaleString("en")} `}
                <OverlayTrigger
                  overlay={
                    <Tooltip id="remaining-tooltip">
                      Your claimable amount now for this month is{" "}
                      {remaining != null &&
                        Number(remaining).toLocaleString("en")}{" "}
                      CKB.
                    </Tooltip>
                  }
                >
                  <FontAwesomeIcon className="ml-1" icon={faCircleQuestion} />
                </OverlayTrigger>
              </Col>
            </Form.Group>
          )}
      </Row>
      <Row className="justify-content-center">
        <Button
          id="claim_button"
          disabled={isSubmitting || !values.addressHash || !!errors.addressHash}
          type="submit"
        >
          {isSubmitting ? "Claiming" : "Claim"}
        </Button>
      </Row>
    </Form>
  );
};

export default ClaimEventForm;
