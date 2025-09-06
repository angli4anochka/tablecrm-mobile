import React, { useState, useEffect } from 'react';

interface AdditionalParams {
  number?: string;
  comment?: string;
  contract?: string;
  tags?: string[];
  dealId?: string;
}

interface AdditionalParamsModalProps {
  isOpen: boolean;
  onClose: () => void;
  params: AdditionalParams;
  onSave: (params: AdditionalParams) => void;
}

const AdditionalParamsModal: React.FC<AdditionalParamsModalProps> = ({
  isOpen,
  onClose,
  params,
  onSave
}) => {
  const [localParams, setLocalParams] = useState<AdditionalParams>(params);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    setLocalParams(params);
  }, [params]);

  if (!isOpen) return null;

  const handleAddTag = () => {
    if (tagInput.trim()) {
      setLocalParams({
        ...localParams,
        tags: [...(localParams.tags || []), tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (index: number) => {
    const newTags = [...(localParams.tags || [])];
    newTags.splice(index, 1);
    setLocalParams({
      ...localParams,
      tags: newTags
    });
  };

  const handleSave = () => {
    onSave(localParams);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Дополнительные параметры</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* Номер */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Номер
            </label>
            <input
              type="text"
              value={localParams.number || ''}
              onChange={(e) => setLocalParams({ ...localParams, number: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Введите номер"
            />
          </div>

          {/* Комментарий */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Комментарий
            </label>
            <textarea
              value={localParams.comment || ''}
              onChange={(e) => setLocalParams({ ...localParams, comment: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Введите комментарий"
            />
          </div>

          {/* Договор */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Договор
            </label>
            <input
              type="text"
              value={localParams.contract || ''}
              onChange={(e) => setLocalParams({ ...localParams, contract: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Введите номер договора"
            />
          </div>

          {/* Теги */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Теги
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Введите или выберите теги"
              />
              <button
                onClick={handleAddTag}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Добавить
              </button>
            </div>
            {localParams.tags && localParams.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {localParams.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(index)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Сделка */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Сделка
            </label>
            <input
              type="text"
              value={localParams.dealId || ''}
              onChange={(e) => setLocalParams({ ...localParams, dealId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Введите ID сделки"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdditionalParamsModal;