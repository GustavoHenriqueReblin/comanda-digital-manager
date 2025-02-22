/* eslint-disable react-hooks/exhaustive-deps */
import './bartenderAuth.scss';

import Header from '../../components/Header/Header';
import { routes } from "../../types/types";
import { BartenderLogin, FindBartender } from "../../graphql/queries/bartender";
import { CancelAuthBartenderRequest } from "../../graphql/mutations/bartender";

import React, { useEffect, useState } from "react";
import Cookies from 'js-cookie';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLazyQuery, useMutation, useSubscription } from "@apollo/client";
import { useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from "react-helmet";
import { BARTENDER_AUTH_RESPONSE } from '../../graphql/subscriptions/bartender';

interface BartenderFormData {
    securityCode: string;
};

const bartenderFormSchema = z.object({
    securityCode: z.string().nonempty('O código é obrigatório'),
});

function BartenderAuth() {
    const { register, setValue: setSecurityCodeValue, handleSubmit, formState: { errors } } = useForm<BartenderFormData>({
        resolver: zodResolver(bartenderFormSchema),
    });

    const [isWaiting, setisWaiting] = useState<boolean>(false);
    const [getBartender] = useLazyQuery(FindBartender, {fetchPolicy: 'network-only'});
    const [bartenderLogin] = useLazyQuery(BartenderLogin, {fetchPolicy: 'network-only'});
    
    useSubscription(BARTENDER_AUTH_RESPONSE, {
        onSubscriptionData: (res) => {
            const data = res.subscriptionData.data.authBartenderResponse;
            if (!data.authRequestStatus) {
                Cookies.remove(process.env.REACT_APP_COOKIE_AUTH_BARTENDER_TOKEN_NAME ?? "");
                setisWaiting(false);
            }
            navigate('/myorders');
        }
    });
    const [cancelAuthBartenderRequest] = useMutation(CancelAuthBartenderRequest);

    const navigate = useNavigate();
    const location = useLocation();
    const currentPage = routes.find(page => page.route === location.pathname);
    const pageTitle = currentPage ? currentPage.title : 'Comanda digital';

    const onSubmit = (data: BartenderFormData) => {
        const { securityCode } = data;
        try {
            bartenderLogin({
                variables: { input: { securityCode: securityCode } },
            })
                .then((res) => {
                    const data = res?.data?.bartenderLogin?.data[0];
                    if (data && data !== null && data.id > 0) {
                        setisWaiting(true);
                    }
                });
        } catch (error) {
            console.error("Erro ao buscar o garçom:", error);
        }
    };

    const cancelRequest = async () => {
        const token = Cookies.get(process.env.REACT_APP_COOKIE_AUTH_BARTENDER_TOKEN_NAME ?? "");
        const bartender = await getBartender({
            variables: { input: { token } },
        });

        cancelAuthBartenderRequest({
            variables: {
                input: {
                    bartenderId: Number(bartender.data.bartender.data[0].id),
                }
            }
        })
            .then(async () => {
                Cookies.remove(process.env.REACT_APP_COOKIE_AUTH_BARTENDER_TOKEN_NAME ?? "");
                setisWaiting(false);
            })
            .catch((err) => {
                console.error(err);
            });
    };

    useEffect(() => {
        const token = Cookies.get(process.env.REACT_APP_COOKIE_AUTH_BARTENDER_TOKEN_NAME ?? "");
        
        if (token) {
            setisWaiting(!!token);
            getBartender({
                variables: { input: { token } },
            })
                .then((res) => {
                    const data = res?.data?.bartender?.data[0];
                    if (data && data !== null && data.id > 0) {
                        setSecurityCodeValue("securityCode", data.securityCode?.toString() ?? "");
                    }
                });
        }
    }, []);
    
    return (
        <>
            <Helmet>
                <title>{pageTitle}</title>
            </Helmet>
            <div className='main-content'>
                <Header />
                <form className="bartender-container" onSubmit={handleSubmit(onSubmit)}>
                    <label className='label-input'>Seu código de segurança:</label>
                    <input
                        className='input'
                        type="text"
                        aria-label="securityCode input"
                        placeholder="Código de garçom"
                        {...register('securityCode')}
                        disabled={isWaiting}
                    />
                    {errors.securityCode && <span className='error-input'>{errors.securityCode.message}</span>}
                    { isWaiting
                    ? (
                        <>
                            <label className='label-input'>Aguardando aprovação...</label>
                            <button 
                                className='button'
                                type="button"
                                onClick={() => cancelRequest()}
                            >Cancelar</button>
                        </>
                    ) 
                    : (<button className='button' type="submit">Enviar</button>)}
                </form>
            </div>
        </>
    )
}

export default BartenderAuth;