/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import './bartenderAuth.scss';
import Loading from "../../components/Loading";

import Cookies from 'js-cookie';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLazyQuery, useMutation, useSubscription } from "@apollo/client";
import { BARTENDER_AUTH_RESPONSE, GetBartender, UPDATE_BARTENDER } from "../../graphql/queries/bartenderQueries";
import { useNavigate } from 'react-router-dom';

interface BartenderFormData {
    securityCode: string;
};

interface BartenderData {
    id: string;
    name: string;
    securityCode: string;
    isWaiting: boolean;
    isApproved: boolean;
    token: string;
}

const bartenderFormSchema = z.object({
    securityCode: z.string().nonempty('O código é obrigatório'),
});

function BartenderAuth() {
    const [loading, setLoading] = useState(true);
    const [isInputBlocked, setIsInputBlocked] = useState(false);
    const [resMessage, setResMessage] = useState('');
    const [updateBartender] = useMutation(UPDATE_BARTENDER);
    const { data: authResponseData } = useSubscription(BARTENDER_AUTH_RESPONSE);
    const [bartenderDataIsWaiting, setBartenderDataIsWaiting] = useState(null);
    const [getBartender, { data: bartenderData }] = useLazyQuery(GetBartender, {fetchPolicy: 'cache-and-network'});
    const { register, setValue: setSecurityCodeValue, handleSubmit, formState: { errors } } = useForm<BartenderFormData>({
        resolver: zodResolver(bartenderFormSchema),
    });
    const navigate = useNavigate();

    const verifyRequstAuthInCookie = (): boolean => {
        const cookieName = process.env.REACT_APP_COOKIE_NAME_BARTENDER_REQUEST;
        const bartenderDataIsWaiting = Cookies.get(cookieName ? cookieName : ''); 
        const res = !!bartenderDataIsWaiting;  
        setBartenderDataIsWaiting(res ? () => {
            const data = JSON.parse(bartenderDataIsWaiting);
            setSecurityCodeValue('securityCode', data.securityCode);
            setIsInputBlocked(true);
            return data
        } : null);

        return res;
    };

    const verifyBartenderToken = () => {
        const cookieName = process.env.REACT_APP_COOKIE_NAME_BARTENDER_TOKEN;
        const bartenderToken = Cookies.get(cookieName ? cookieName : '');  
        if (bartenderToken) {
            navigate('/queue');
        }
    };

    const deleteCookie = (cookieName: any) => {
        if (cookieName) {
            Cookies.remove(cookieName);
        }
    };

    const saveBartenderData = (data: BartenderData) => {
        let cookieName;
        const { isWaiting, isApproved, token, ...bartenderData } = data;
        
        cookieName = process.env.REACT_APP_COOKIE_NAME_BARTENDER_TOKEN;
        if (cookieName) {
            Cookies.set(cookieName, JSON.stringify(token), { expires: 1 });
        }

        cookieName = process.env.REACT_APP_COOKIE_NAME_BARTENDER_DATA;
        if (cookieName) {
            Cookies.set(cookieName, JSON.stringify(bartenderData), { expires: 1 });
        }          
    };

    const cancelRequestWait = (refresh: boolean = false) => {
        setIsInputBlocked(false);
        setSecurityCodeValue('securityCode', "");

        const cookieName = process.env.REACT_APP_COOKIE_NAME_BARTENDER_REQUEST;
        if (cookieName) {
          const bartender = Cookies.get(cookieName);
          
          if (bartender) {
            const bartenderObj = JSON.parse(bartender);
            updateBartender({
              variables: {
                input: {
                  id: bartenderObj.id,
                  isWaiting: false,
                  isApproved: false,
                  token: "",
                },
              },
            });
          }
        }
      
        deleteCookie(cookieName);
        refresh && window.location.reload();
    };

    useEffect(() => { 
       verifyBartenderToken();   
 
        if (bartenderData && bartenderData.bartender.data !== null && bartenderData.bartender.data.id > 0) {
            const data = bartenderData.bartender.data;
            const hasResponse = data.isApproved != null;
            
            if (!hasResponse && verifyRequstAuthInCookie()) { // Já enviou a solicitação...
                setLoading(false);
                return;
            }        
            
            if (!data.isWaiting) {
                if (!hasResponse) { // Enviou a solicitação
                    updateBartender({ variables: {
                        input: {
                            id: data.id, 
                            isWaiting: true,
                            token: data.token
                        },
                    }, });

                    const cookieName = process.env.REACT_APP_COOKIE_NAME_BARTENDER_REQUEST;
                    if (cookieName) {
                        Cookies.set(cookieName, JSON.stringify(data), { expires: 0.0416667 }); // 1 hora
                    }
                    verifyRequstAuthInCookie();

                } else { // Recebeu resposta da solicitação
                    cancelRequestWait();
                    const { id } = bartenderDataIsWaiting ? bartenderDataIsWaiting : { id: 0 };
                    if (data.token && Number(id) === Number(data.id) && data.isApproved) { // Aprovou
                        saveBartenderData(data);
                        verifyBartenderToken();
                    } else { // Recusou
                        window.location.reload();
                    }
                }
            }
        } else if (!verifyRequstAuthInCookie()) {
            setIsInputBlocked(false);
            setSecurityCodeValue('securityCode', "");
        }

        if (bartenderData && bartenderData.bartender.message !== null) {
            setResMessage(bartenderData.bartender.message);
        };

        setLoading(false);
    }, [bartenderData, authResponseData]);

    const validateBartenderCode = (data: BartenderFormData) => {
        const { securityCode } = data;
        try {
            setResMessage('');
            getBartender({
                variables: { input: { securityCode: securityCode } },
            });
        } catch (error) {
            console.error("Erro ao buscar o garçom:", error);
        }
    };

    return (
        <>
            { loading 
            ? ( <Loading title="Aguarde, carregando..." /> ) 
            : (
                <form className="bartender-container" onSubmit={handleSubmit(validateBartenderCode)}>
                    <label className='label-input'>Seu código de segurança:</label>
                    <input
                        className='input'
                        type="text"
                        aria-label="securityCode input"
                        placeholder="Código de garçom"
                        {...register('securityCode')}
                        disabled={isInputBlocked}
                    />
                    {errors.securityCode && <span className='error-input'>{errors.securityCode.message}</span>}
                    {resMessage !== '' && <span className='error-input'>{resMessage}</span>}
                    { bartenderDataIsWaiting
                    ? (
                        <>
                            <label className='label-input'>Aguardando aprovação...</label>
                            <button onClick={() => cancelRequestWait(true)} className='button' type="button">Cancelar</button>
                        </>
                    ) 
                    : (<button className='button' type="submit">Enviar</button>)}
                </form>
            )}
        </>
    )
}

export default BartenderAuth;