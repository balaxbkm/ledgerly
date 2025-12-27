"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";

interface DatePickerProps {
    value?: string | Date; // Accepting string (yyyy-MM-dd) or Date object
    onChange: (date: string) => void; // Returns yyyy-MM-dd string
    placeholder?: string;
    className?: string;
    label?: string;
    error?: string;
    minDate?: Date;
    maxDate?: Date;
}

export function CustomDatePicker({ value, onChange, placeholder = "Select date", className, label, error }: DatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(
        value ? (typeof value === 'string' ? new Date(value) : value) : undefined
    );
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });

    const containerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Update internal state when prop changes
    useEffect(() => {
        if (value) {
            const date = typeof value === 'string' ? new Date(value) : value;
            setSelectedDate(date);
            setViewDate(date); // Sync view to selected date
        }
    }, [value]);

    const calculatePosition = () => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setDropdownPos({
                top: rect.bottom + window.scrollY + 8, // 8px Offset
                left: rect.left + window.scrollX,
            });
        }
    };

    const toggleOpen = () => {
        if (!isOpen) {
            calculatePosition();
            setIsOpen(true);
        } else {
            setIsOpen(false);
        }
    };

    // Recalculate position on resize/scroll if open
    useEffect(() => {
        if (!isOpen) return;
        const handleResize = () => calculatePosition();
        window.addEventListener("resize", handleResize);
        window.addEventListener("scroll", handleResize, true); // true for capture to catch all scrolls

        return () => {
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("scroll", handleResize, true);
        };
    }, [isOpen]);

    // Handle clicking outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Check if click is outside both the input container AND the portal dropdown
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node) &&
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handlePrevMonth = () => setViewDate(subMonths(viewDate, 1));
    const handleNextMonth = () => setViewDate(addMonths(viewDate, 1));

    const handleDayClick = (day: Date) => {
        const formatted = format(day, "yyyy-MM-dd");
        onChange(formatted);
        setSelectedDate(day);
        setIsOpen(false);
    };

    // Generate days
    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

    return (
        <div className={cn("space-y-2", className)} >
            {label && <label className="text-sm font-semibold text-slate-600">{label}</label>}

            <div ref={containerRef} className="relative">
                <Button
                    type="button"
                    variant="outline"
                    onClick={toggleOpen}
                    className={cn(
                        "w-full pl-3 text-left font-normal h-11 border-slate-200 bg-white hover:bg-slate-50 transition-all rounded-xl",
                        !value && "text-muted-foreground",
                        isOpen && "ring-2 ring-indigo-500 border-indigo-500"
                    )}
                >
                    {selectedDate ? (
                        <span className="text-slate-900 font-medium tracking-tight">
                            {format(selectedDate, "dd MMM yyyy")}
                        </span>
                    ) : (
                        <span className="text-slate-400">{placeholder}</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>

                {isOpen && typeof document !== "undefined" && createPortal(
                    <div
                        ref={dropdownRef}
                        style={{
                            top: dropdownPos.top,
                            left: dropdownPos.left,
                            position: "absolute"
                        }}
                        className="z-[9999] mt-2 w-72 p-4 rounded-xl border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200 origin-top-left ring-1 ring-black/5"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-base font-bold text-slate-800">
                                {format(viewDate, "MMMM yyyy")}
                            </span>
                            <div className="flex gap-1">
                                <button type="button" onClick={handlePrevMonth} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors">
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                                <button type="button" onClick={handleNextMonth} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors">
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        {/* Weekday Names */}
                        <div className="grid grid-cols-7 mb-2 text-center">
                            {weekDays.map((d) => (
                                <span key={d} className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                    {d}
                                </span>
                            ))}
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-1">
                            {days.map((day, idx) => {
                                const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
                                const isCurrentMonth = isSameMonth(day, monthStart);
                                const isTodayDate = isToday(day);

                                return (
                                    <button
                                        key={day.toString()}
                                        type="button"
                                        onClick={() => handleDayClick(day)}
                                        className={cn(
                                            "h-9 w-9 rounded-lg flex items-center justify-center text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50",
                                            !isCurrentMonth && "text-slate-300",
                                            isCurrentMonth && "text-slate-700 hover:bg-slate-100 font-medium",
                                            isTodayDate && !isSelected && "bg-indigo-50 text-indigo-700 font-bold decoration-2 decoration-indigo-500",
                                            isSelected && "bg-[#0f1729] text-white font-bold shadow-lg shadow-[#0f1729]/30 hover:bg-[#0f1729] hover:text-white"
                                        )}
                                    >
                                        {format(day, "d")}
                                    </button>
                                );
                            })}
                        </div>
                    </div>,
                    document.body
                )}
            </div>
            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
        </div>
    );
}
