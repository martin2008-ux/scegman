import React, { useMemo, useState } from 'react';
import { Hash, MessageSquare, Send, Trash2, Users } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { useScegman } from '../context/ScegmanContext';
import type { InternalMessage, MessageTag } from '../types/scegman';

const CHANNELS: InternalMessage['channel'][] = [
  'General Planta',
  'Turno Mañana',
  'Bodega y Repuestos',
  'Supervisión',
];

const TAGS: MessageTag[] = ['General', 'Urgente', 'Repuesto', 'Turno'];

export function MessagesPage() {
  const { state, setActiveWorkerId, sendMessage, deleteMessage } = useScegman();
  const [activeChannel, setActiveChannel] = useState<string>('Todos');
  const [recipient, setRecipient] = useState('Todo el equipo');
  const [channel, setChannel] = useState<InternalMessage['channel']>('General Planta');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [tag, setTag] = useState<MessageTag>('General');

  const activeWorker =
    state.workers.find((w) => w.id === state.activeWorkerId) ?? state.workers[0];

  const visibleMessages = useMemo(() => {
    return state.messages.filter(
      (m) => activeChannel === 'Todos' || m.channel === activeChannel
    );
  }, [state.messages, activeChannel]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !subject.trim()) return;

    sendMessage({
      channel,
      senderId: activeWorker.id,
      senderName: activeWorker.name,
      senderRole: activeWorker.role,
      recipient,
      subject: subject.trim(),
      content: content.trim(),
      tag,
    });

    setSubject('');
    setContent('');
  };

  const getTagVariant = (t: MessageTag) => {
    switch (t) {
      case 'Urgente':
        return 'red';
      case 'Repuesto':
        return 'amber';
      case 'Turno':
        return 'blue';
      default:
        return 'slate';
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Left sidebar: Channels & Team */}
      <div className="space-y-4 lg:col-span-4 xl:col-span-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <h3 className="mb-3 flex items-center gap-2 text-xs font-bold tracking-wide text-slate-500 uppercase">
            <Hash className="h-3.5 w-3.5 text-blue-600" /> Canales Operativos
          </h3>
          <div className="space-y-1">
            {['Todos', ...CHANNELS].map((ch) => {
              const count =
                ch === 'Todos'
                  ? state.messages.length
                  : state.messages.filter((m) => m.channel === ch).length;
              return (
                <button
                  key={ch}
                  type="button"
                  onClick={() => {
                    setActiveChannel(ch);
                    if (ch !== 'Todos') {
                      setChannel(ch as InternalMessage['channel']);
                    }
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition ${
                    activeChannel === ch
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{ch}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] ${
                      activeChannel === ch
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <h3 className="mb-2 flex items-center gap-2 text-xs font-bold tracking-wide text-slate-500 uppercase">
            <Users className="h-3.5 w-3.5 text-blue-600" /> Cambiar Remitente Demo
          </h3>
          <p className="mb-3 text-[11px] text-slate-500">
            Selecciona un trabajador para enviar mensajes desde su perfil:
          </p>
          <div className="space-y-1.5">
            {state.workers.map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() => setActiveWorkerId(w.id)}
                className={`flex w-full items-center gap-2.5 rounded-xl border px-3 py-2 text-left transition ${
                  w.id === activeWorker.id
                    ? 'border-blue-500 bg-blue-50/70'
                    : 'border-slate-100 hover:bg-slate-50'
                }`}
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-[11px] font-bold text-white">
                  {w.avatarInitials}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-slate-900">{w.name}</p>
                  <p className="truncate text-[10px] text-slate-500">{w.role}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right side: Composer + Message Feed */}
      <div className="space-y-5 lg:col-span-8 xl:col-span-9">
        {/* Compose Box */}
        <form
          onSubmit={handleSend}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"
        >
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
                {activeWorker.avatarInitials}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">
                  Enviando como: {activeWorker.name}
                </p>
                <p className="text-[11px] text-slate-500">{activeWorker.role}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                aria-label="Canal de envío"
                value={channel}
                onChange={(e) =>
                  setChannel(e.target.value as InternalMessage['channel'])
                }
                className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700"
              >
                {CHANNELS.map((ch) => (
                  <option key={ch} value={ch}>
                    {ch}
                  </option>
                ))}
              </select>
              <select
                aria-label="Etiqueta del mensaje"
                value={tag}
                onChange={(e) => setTag(e.target.value as MessageTag)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700"
              >
                {TAGS.map((t) => (
                  <option key={t} value={t}>
                    Etiqueta: {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Asunto del mensaje..."
              className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
            />
            <select
              aria-label="Destinatario"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-700 focus:border-blue-500 focus:bg-white focus:outline-none"
            >
              <option value="Todo el equipo">Para: Todo el equipo</option>
              {state.workers
                .filter((w) => w.id !== activeWorker.id)
                .map((w) => (
                  <option key={w.id} value={w.name}>
                    Para: {w.name} ({w.role})
                  </option>
                ))}
            </select>
          </div>

          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
            <textarea
              required
              rows={2}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escribe novedades de turno, solicitud de repuestos o coordinación técnica..."
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
            />
            <button
              type="submit"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-blue-700"
            >
              <Send className="h-4 w-4" />
              Enviar Mensaje
            </button>
          </div>
        </form>

        {/* Feed */}
        <div className="space-y-3">
          {visibleMessages.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <MessageSquare className="mx-auto h-7 w-7 text-slate-400" />
              <p className="mt-2 text-sm font-semibold text-slate-800">
                No hay mensajes en este canal todavía
              </p>
            </div>
          ) : (
            visibleMessages.map((msg) => (
              <div
                key={msg.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-blue-200"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-blue-700">
                      {msg.senderName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">
                          {msg.senderName}
                        </span>
                        <span className="text-xs text-slate-500">· {msg.senderRole}</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Canal: <strong className="text-slate-600">{msg.channel}</strong> · Para:{' '}
                        <strong className="text-slate-600">{msg.recipient}</strong> · {msg.timestamp}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={getTagVariant(msg.tag)}>{msg.tag}</Badge>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('¿Eliminar este mensaje?')) {
                          deleteMessage(msg.id);
                        }
                      }}
                      title="Eliminar mensaje"
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <h4 className="mt-3 text-sm font-semibold text-slate-900">{msg.subject}</h4>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{msg.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
