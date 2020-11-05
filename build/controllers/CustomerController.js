"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Yup = __importStar(require("yup"));
const axios_1 = __importDefault(require("axios"));
async function findCustomer(email) {
    try {
        const { SERVER_IUGU_URL, TOKEN_PROD_IUGU } = process.env;
        const iuguResponse = await axios_1.default.get(`${SERVER_IUGU_URL}/v1/customers`, {
            params: {
                query: email,
                api_token: TOKEN_PROD_IUGU,
            },
        });
        if (!iuguResponse.data ||
            !iuguResponse.data.items ||
            iuguResponse.data.items.length === 0 ||
            (iuguResponse.status !== 200 && iuguResponse.status !== 201)) {
            return null;
        }
        return iuguResponse.data.items[0];
    }
    catch (error) {
        console.error("findCustomer error", error);
        return null;
    }
}
async function createCustomer(customer) {
    try {
        const { SERVER_IUGU_URL, TOKEN_PROD_IUGU } = process.env;
        const iuguResponse = await axios_1.default.post(`${SERVER_IUGU_URL}/v1/customers`, Object.assign(Object.assign({}, customer), { api_token: TOKEN_PROD_IUGU }), {
            headers: { "Content-Type": "application/json" },
        });
        if (!iuguResponse.data ||
            (iuguResponse.status !== 200 && iuguResponse.status !== 201)) {
            return null;
        }
        return iuguResponse.data;
    }
    catch (error) {
        return null;
    }
}
async function findOrCreateCustomer(customer) {
    const existingCustomer = await findCustomer(customer.email);
    if (existingCustomer !== null)
        return existingCustomer;
    return await createCustomer(customer);
}
async function createSubscription(customerId, planId) {
    try {
        const { SERVER_IUGU_URL, TOKEN_PROD_IUGU } = process.env;
        const iuguResponse = await axios_1.default.post(`${SERVER_IUGU_URL}/v1/subscriptions`, {
            customer_id: customerId,
            plan_identifier: planId,
            api_token: TOKEN_PROD_IUGU,
        });
        if (!iuguResponse.data ||
            (iuguResponse.status !== 200 && iuguResponse.status !== 201)) {
            return null;
        }
        return iuguResponse.data.recent_invoices[0].secure_url;
    }
    catch (error) {
        return null;
    }
}
exports.default = {
    async helloWorld(request, response) {
        return response.status(200).json({ message: "Hello World" });
    },
    async register(request, response) {
        const { email, name, phone_prefix, phone, cpf_cnpj, street, number, district, city, state, zip_code, plan_identifier, } = request.body;
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
                .test("phone_prefix", "O prefixo só pode ter no máximo 3 digitos", (val) => ((val === null || val === void 0 ? void 0 : val.toString().length) || 0) <= 3),
            phone: Yup.number()
                .required()
                .test("phone", "O telefone só pode ter no máximo 9 digitos", (val) => ((val === null || val === void 0 ? void 0 : val.toString().length) || 0) <= 9),
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
