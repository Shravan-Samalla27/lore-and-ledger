'use client';

import React, { useState } from 'react';
import { useLibrary, Book } from '@/context/LibraryContext';

interface NewAcquisitionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewAcquisitionModal({ isOpen, onClose }: NewAcquisitionModalProps) {
  const { addBook } = useLibrary();

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    edition: 'First Edition, 1888',
    category: 'Alchemy & Medicine',
    dewey: '',
    callNo: '',
    totalCopies: 1,
    shelf: 'Bay II, Shelf B',
    wing: 'North Gallery',
    binding: 'Calfskin',
    status: 'AVAILABLE' as Book['status'],
    notes: '',
    conservationRating: 'Pristine' as Book['conservationRating'],
    accessionNo: `#A-${Math.floor(5000 + Math.random() * 4999)}`,
    year: 1888
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.author || !formData.callNo) {
      alert('Please fill in title, author, and call number.');
      return;
    }

    addBook({
      ...formData,
      totalCopies: Number(formData.totalCopies)
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-surface-container rounded-xl border-2 border-secondary/60 max-w-2xl w-full p-space-lg shadow-2xl relative my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-secondary/20 pb-space-sm mb-space-md">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[28px]">
              auto_stories
            </span>
            <div>
              <h2 className="font-headline-md text-headline-md text-primary font-bold">
                Accession New Folio
              </h2>
              <span className="font-stamp-label text-stamp-label text-secondary uppercase tracking-widest">
                Scriptorium Master Registry
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-primary p-1 rounded hover:bg-surface-container-high"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-space-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
            <div>
              <label className="block font-stamp-label text-[11px] text-secondary uppercase tracking-wider mb-1">
                Volume Title *
              </label>
              <input
                required
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. De Revolutionibus Orbium Coelestium"
                className="w-full px-3 py-2 bg-surface-container-low rounded border border-secondary/40 font-body-md text-on-surface focus:border-secondary focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-stamp-label text-[11px] text-secondary uppercase tracking-wider mb-1">
                Author / Scribe *
              </label>
              <input
                required
                value={formData.author}
                onChange={e => setFormData({ ...formData, author: e.target.value })}
                placeholder="e.g. Nicolaus Copernicus"
                className="w-full px-3 py-2 bg-surface-container-low rounded border border-secondary/40 font-body-md text-on-surface focus:border-secondary focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
            <div>
              <label className="block font-stamp-label text-[11px] text-secondary uppercase tracking-wider mb-1">
                Call Number *
              </label>
              <input
                required
                value={formData.callNo}
                onChange={e => setFormData({ ...formData, callNo: e.target.value })}
                placeholder="e.g. AST-521.1-C"
                className="w-full px-3 py-2 bg-surface-container-low rounded border border-secondary/40 font-code-ledger text-on-surface focus:border-secondary focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-stamp-label text-[11px] text-secondary uppercase tracking-wider mb-1">
                Dewey Classification
              </label>
              <input
                value={formData.dewey}
                onChange={e => setFormData({ ...formData, dewey: e.target.value })}
                placeholder="e.g. 521.1 COP"
                className="w-full px-3 py-2 bg-surface-container-low rounded border border-secondary/40 font-code-ledger text-on-surface focus:border-secondary focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-stamp-label text-[11px] text-secondary uppercase tracking-wider mb-1">
                Total Exemplars (Copies)
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={formData.totalCopies}
                onChange={e => setFormData({ ...formData, totalCopies: parseInt(e.target.value, 10) || 1 })}
                className="w-full px-3 py-2 bg-surface-container-low rounded border border-secondary/40 font-code-ledger text-on-surface focus:border-secondary focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
            <div>
              <label className="block font-stamp-label text-[11px] text-secondary uppercase tracking-wider mb-1">
                Wing / Section
              </label>
              <select
                value={formData.wing}
                onChange={e => setFormData({ ...formData, wing: e.target.value })}
                className="w-full px-3 py-2 bg-surface-container-low rounded border border-secondary/40 font-body-sm text-on-surface focus:border-secondary focus:outline-none"
              >
                <option value="North Gallery">North Gallery</option>
                <option value="West Wing">West Wing</option>
                <option value="Special Collections Vault">Special Collections Vault</option>
                <option value="South Cloisters">South Cloisters</option>
              </select>
            </div>

            <div>
              <label className="block font-stamp-label text-[11px] text-secondary uppercase tracking-wider mb-1">
                Shelf Location
              </label>
              <input
                value={formData.shelf}
                onChange={e => setFormData({ ...formData, shelf: e.target.value })}
                placeholder="e.g. Bay IV, Shelf C"
                className="w-full px-3 py-2 bg-surface-container-low rounded border border-secondary/40 font-body-sm text-on-surface focus:border-secondary focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-stamp-label text-[11px] text-secondary uppercase tracking-wider mb-1">
                Binding Material
              </label>
              <select
                value={formData.binding}
                onChange={e => setFormData({ ...formData, binding: e.target.value })}
                className="w-full px-3 py-2 bg-surface-container-low rounded border border-secondary/40 font-body-sm text-on-surface focus:border-secondary focus:outline-none"
              >
                <option value="Calfskin">Calfskin</option>
                <option value="Parchment">Parchment</option>
                <option value="Morocco Leather">Morocco Leather</option>
                <option value="Vellum">Vellum</option>
                <option value="Velvet Cloth">Velvet Cloth</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-stamp-label text-[11px] text-secondary uppercase tracking-wider mb-1">
              Curator Bibliographic Notes
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Provide notes on provenance, woodcuts, marginalia, or paper condition..."
              className="w-full px-3 py-2 bg-surface-container-low rounded border border-secondary/40 font-body-sm text-on-surface focus:border-secondary focus:outline-none"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-space-sm pt-space-sm border-t border-secondary/20">
            <button
              type="button"
              onClick={onClose}
              className="px-space-md py-2 bg-surface-container-high rounded text-on-surface font-body-sm hover:bg-surface-dim transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-space-lg py-2 bg-primary text-secondary-fixed rounded border border-secondary font-body-sm font-semibold shadow hover:bg-primary-container transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">verified</span>
              Affix Seal &amp; Register Folio
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
