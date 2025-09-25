
import React, { useState } from 'react';
import { Modal } from './Modal';
import { Icon } from './Icon';
import { analytics } from '../services/analytics';

interface NPSModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const NPSModal: React.FC<NPSModalProps> = ({ isOpen, onClose }) => {
    const [score, setScore] = useState<number | null>(null);
    const [comment, setComment] = useState('');

    const handleSubmit = () => {
        analytics.track('nps_submitted', {
            score,
            commentLength: comment.length,
        });
        // In a real application, you would send this data to your analytics service
        console.log({
            npsScore: score,
            comment: comment
        });
        alert('Obrigado pelo seu feedback!');
        onClose();
    };
    
    const getScoreColor = (value: number) => {
        if (value <= 6) return 'bg-red-500 hover:bg-red-600';
        if (value <= 8) return 'bg-yellow-500 hover:bg-yellow-600';
        return 'bg-green-500 hover:bg-green-600';
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Sua opinião é importante!">
            <div className="text-center">
                <Icon name="emoji_emotions" size="lg" className="text-purple-500 mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Em uma escala de 0 a 10, qual a probabilidade de você recomendar o Painel de Líderes a um colega?</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Sua resposta nos ajuda a melhorar sua experiência.</p>

                <div className="flex justify-center flex-wrap gap-2 my-6">
                    {[...Array(11).keys()].map(value => (
                        <button
                            key={value}
                            onClick={() => setScore(value)}
                            className={`w-10 h-10 rounded-full text-white font-bold text-sm transition-transform transform flex items-center justify-center
                                ${score === value 
                                    ? `${getScoreColor(value)} ring-4 ring-offset-2 dark:ring-offset-gray-800 ring-purple-400 scale-110` 
                                    : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                                }
                            `}
                        >
                            {value}
                        </button>
                    ))}
                </div>

                {score !== null && (
                     <div className="text-left mt-4 animate-fadeIn">
                        <label htmlFor="nps-comment" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                           O que motivou sua nota? (Opcional)
                        </label>
                        <textarea
                            id="nps-comment"
                            rows={3}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Deixe seu comentário aqui..."
                            className="w-full mt-2 p-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                        />
                    </div>
                )}
                
                <div className="flex justify-center gap-4 mt-8">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-transparent rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        Agora não
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={score === null}
                        className="px-6 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors shadow-md disabled:bg-purple-400 dark:disabled:bg-purple-800 disabled:cursor-not-allowed"
                    >
                        Enviar Avaliação
                    </button>
                </div>
            </div>
             <style>{`
                @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
            `}</style>
        </Modal>
    );
};
