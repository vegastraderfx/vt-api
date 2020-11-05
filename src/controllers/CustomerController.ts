import { Request, Response } from "express";
import * as Yup from "yup";
import axios from "axios";

interface Customer {
  email: string;
  name: string;
  phone_prefix: number;
  phone: number;
  cpf_cnpj: number;
  street: string;
  number: string;
  district: string;
  city: string;
  state: string;
  zip_code: string;
}

async function findCustomer(email: string) {
  try {
    const { SERVER_IUGU_URL, TOKEN_PROD_IUGU } = process.env;
    const iuguResponse = await axios.get(`${SERVER_IUGU_URL}/v1/customers`, {
      params: {
        query: email,
        api_token: TOKEN_PROD_IUGU,
      },
    });

    if (
      !iuguResponse.data ||
      !iuguResponse.data.items ||
      iuguResponse.data.items.length === 0 ||
      (iuguResponse.status !== 200 && iuguResponse.status !== 201)
    ) {
      return null;
    }

    return iuguResponse.data.items[0];
  } catch (error) {
    console.error("findCustomer error", error);
    return null;
  }
}

async function createCustomer(customer: Customer) {
  try {
    const { SERVER_IUGU_URL, TOKEN_PROD_IUGU } = process.env;
    const iuguResponse = await axios.post(
      `${SERVER_IUGU_URL}/v1/customers`,
      { ...customer, api_token: TOKEN_PROD_IUGU },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    if (
      !iuguResponse.data ||
      (iuguResponse.status !== 200 && iuguResponse.status !== 201)
    ) {
      return null;
    }

    return iuguResponse.data;
  } catch (error) {
    return null;
  }
}

async function findOrCreateCustomer(customer: Customer) {
  const existingCustomer = await findCustomer(customer.email);
  if (existingCustomer !== null) return existingCustomer;
  return await createCustomer(customer);
}

async function createSubscription(customerId: string, planId: string) {
  try {
    const { SERVER_IUGU_URL, TOKEN_PROD_IUGU } = process.env;
    const iuguResponse = await axios.post(
      `${SERVER_IUGU_URL}/v1/subscriptions`,
      {
        customer_id: customerId,
        plan_identifier: planId,
        api_token: TOKEN_PROD_IUGU,
      }
    );

    if (
      !iuguResponse.data ||
      (iuguResponse.status !== 200 && iuguResponse.status !== 201)
    ) {
      return null;
    }

    return iuguResponse.data.recent_invoices[0].secure_url;
  } catch (error) {
    return null;
  }
}

export default {
  async helloWorld(request: Request, response: Response) {
    return response.status(200).json({ message: "Hello World" });
  },
  async register(request: Request, response: Response) {
    const {
      email,
      name,
      phone_prefix,
      phone,
      cpf_cnpj,
      street,
      number,
      district,
      city,
      state,
      zip_code,
      plan_identifier,
    } = request.body;

    const body = {
      email,
      name,
      phone_prefix,
      phone,
      cpf_cnpj,
      street,
      number,
      district,
      city,
      state,
      zip_code,
    };

    const schema = Yup.object().shape({
      email: Yup.string().required(),
      name: Yup.string().required(),
      phone_prefix: Yup.number()
        .required()
        .test(
          "phone_prefix",
          "O prefixo só pode ter no máximo 3 digitos",
          (val) => (val?.toString().length || 0) <= 3
        ),
      phone: Yup.number()
        .required()
        .test(
          "phone",
          "O telefone só pode ter no máximo 9 digitos",
          (val) => (val?.toString().length || 0) <= 9
        ),
      cpf_cnpj: Yup.string().required(),
      street: Yup.string().required(),
      number: Yup.string().required(),
      district: Yup.string().required(),
      city: Yup.string().required(),
      state: Yup.string().required(),
      zip_code: Yup.string().required(),
    });

    await schema.validate(body, { abortEarly: false });

    const customer = await findOrCreateCustomer(body);

    if (customer === null) {
      return response.status(500).json({
        message: "Erro ao comunicar com servidor da IUGU",
      });
    }

    const paymentUrl = await createSubscription(customer.id, plan_identifier);

    return response.status(201).json({ urlDoBoleto: paymentUrl });
  },
};
