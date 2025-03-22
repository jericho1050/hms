'use client';

import type React from 'react';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { 
  Loader2, 
  Brain, 
  X, 
  MessageSquare, 
  Minimize2,
  AlertTriangle,
  Stethoscope,
  ClipboardCheck,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { parseAIResponse, formatDiagnosisForDisplay } from '@/utils/ai-response-parser';
import { Separator } from '@/components/ui/separator';
import ReactMarkdown from 'react-markdown';

interface FloatingDiagnosisAssistantProps {
  patientId?: string;
  patientName?: string;
}

export function FloatingDiagnosisAssistant({
  patientId = '',
  patientName = 'this patient',
}: FloatingDiagnosisAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [symptoms, setSymptoms] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!symptoms.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter the patient symptoms',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setAiResponse('');

    try {
      const response = await fetch('/api/ai-diagnosis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId,
          symptoms,
          medicalHistory,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get AI diagnosis');
      }

      const data = await response.json();
      // Clean and parse the response
      const cleanedResponse = parseAIResponse(data.suggestions);
      setAiResponse(cleanedResponse);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };


  const minimizeWidget = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMinimized(true);
  };

  const closeWidget = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    setIsMinimized(true);
  };

  return (
    <div className='fixed bottom-6 left-6 z-[9999]'>
      {/* Hidden button for external toggling */}
      <button 
        id="ai-assistant-toggle" 
        onClick={() => {
          setIsOpen(true);
          setIsMinimized(!isMinimized);
        }} 
        className="sr-only"
        aria-hidden="true"
      />
      
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className='mb-4 w-[350px] md:w-[450px] shadow-xl'
            onClick={(e) => e.stopPropagation()}
          >
            <Card className='shadow-lg border-primary/10'>
              <CardHeader className='pb-2'>
                <div className='flex items-center justify-between'>
                  <CardTitle className='text-lg flex items-center gap-2'>
                    <Brain className='h-5 w-5 text-primary' />
                    AI Diagnosis Assistant
                  </CardTitle>
                  <div className='flex gap-1'>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-7 w-7'
                      onClick={minimizeWidget}
                    >
                      <Minimize2 className='h-4 w-4' />
                      <span className='sr-only'>Minimize</span>
                    </Button>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-7 w-7'
                      onClick={closeWidget}
                    >
                      <X className='h-4 w-4' />
                      <span className='sr-only'>Close</span>
                    </Button>
                  </div>
                </div>
                <CardDescription className='text-xs'>
                  Get AI-powered diagnosis suggestions for {patientName}
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <form onSubmit={handleSubmit} className='space-y-3'>
                  <div className='space-y-1'>
                    <label htmlFor='symptoms' className='text-xs font-medium'>
                      Patient Symptoms
                    </label>
                    <Textarea
                      id='symptoms'
                      placeholder='Enter detailed symptoms...'
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      className='min-h-[80px] text-sm'
                    />
                  </div>
                  <div className='space-y-1'>
                    <label
                      htmlFor='medical-history'
                      className='text-xs font-medium'
                    >
                      Additional Medical History (Optional)
                    </label>
                    <Textarea
                      id='medical-history'
                      placeholder='Enter any relevant medical history...'
                      value={medicalHistory}
                      onChange={(e) => setMedicalHistory(e.target.value)}
                      className='min-h-[80px] text-sm'
                    />
                  </div>
                  <Button
                    type='submit'
                    disabled={isLoading}
                    className='w-full text-sm'
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className='mr-2 h-3 w-3 animate-spin' />
                        Analyzing...
                      </>
                    ) : (
                      'Get Diagnosis Suggestions'
                    )}
                  </Button>
                </form>

                {aiResponse && (
                  <div className='mt-4 rounded-md border overflow-auto max-h-[350px] bg-white'>
                    <h3 className='p-3 text-sm font-medium sticky top-0 bg-white border-b z-10 flex items-center'>
                      <Stethoscope className="h-4 w-4 mr-2 text-primary" />
                      AI Diagnosis Results
                    </h3>
                    
                    <div className='prose prose-sm max-w-none text-xs p-3 pt-0'>
                      {formatDiagnosisForDisplay(aiResponse).map((section, index) => (
                        <div key={index} className="mb-4">
                          <div className="font-medium text-sm mt-4 mb-2 flex items-center">
                            {section.title.includes("DIFFERENTIAL") ? (
                              <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                            ) : section.title.includes("WORKUP") ? (
                              <ClipboardCheck className="h-4 w-4 mr-2 text-blue-500" />
                            ) : section.title.includes("CONSIDERATIONS") ? (
                              <Info className="h-4 w-4 mr-2 text-violet-500" />
                            ) : (
                              <Brain className="h-4 w-4 mr-2 text-gray-500" />
                            )}
                            {section.title}
                          </div>
                          
                          <div className="prose prose-sm dark:prose-invert max-w-none text-xs p-3 pt-0 dark:bg-gray-800">
                          <div className="whitespace-pre-line">
                              <ReactMarkdown>
                                {section.content}
                              </ReactMarkdown>
                            </div>
                          </div>
                          
                          {index < formatDiagnosisForDisplay(aiResponse).length - 1 && (
                            <Separator className="my-3" />
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className='p-3 text-[10px] text-muted-foreground sticky bottom-0 bg-white border-t'>
                      <AlertTriangle className="h-3 w-3 inline-block mr-1 text-amber-500" />
                      This is an AI-generated suggestion and not a definitive diagnosis. Always consult with a qualified healthcare professional.
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className='pt-0'>
                <p className='text-[10px] text-muted-foreground'>
                  Powered by AI technology to assist medical professionals.
                </p>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className='mb-4 bg-primary text-primary-foreground rounded-full shadow-lg px-4 py-2 flex items-center cursor-pointer'
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(false);
            }}
          >
            <Brain className='h-4 w-4 mr-2' />
            <span className='text-sm font-medium'>AI Assistant</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
