'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import QRCode from 'react-qr-code';
import {
  LogOut, ChevronRight,
  User, Building2, Mail, Phone, Users, Car, UtensilsCrossed, BedDouble, MessageSquare, Check, X
} from 'lucide-react';
import VoiceSessionChat from '../components/VoiceSessionChat';
import LanguageSelector from '../components/LanguageSelector';
import { useLanguageStore } from '@/lib/use-language-store';
import { useGuestStore } from '@/lib/stores/guest-store';
import { generateGuestId, buildGuestRoomUrl } from '@/lib/utils/guest-url';
import { RegisteredGuestData } from '@/types/guest';

// Get current date/time in Japan timezone
const getJapanDateTime = () => {
  const now = new Date();
  const japanTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const dayName = days[japanTime.getDay()];
  const monthName = months[japanTime.getMonth()];
  const date = japanTime.getDate();
  const year = japanTime.getFullYear();
  const hours = japanTime.getHours();
  const minutes = japanTime.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;

  return {
    fullDate: dayName + ', ' + monthName + ' ' + date + ', ' + year,
    time: hour12 + ':' + minutes.toString().padStart(2, '0') + ' ' + ampm,
    dayName,
    hour: hours,
    greeting: hours < 12 ? 'Good morning' : hours < 17 ? 'Good afternoon' : 'Good evening'
  };
};
