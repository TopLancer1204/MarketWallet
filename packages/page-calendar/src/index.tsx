// Copyright 2017-2020 @polkadot/app-calendar authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { DateState } from './types';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { Tabs } from '@polkadot/react-components';

import Day from './Day';
import Month from './Month';
import { useTranslation } from './translate';
import useScheduled from './useScheduled';
import { getDateState, nextMonth, prevMonth } from './util';

interface Props {
  basePath: string;
  className?: string;
}

const NOW_INC = 30 * 1000;

function CalendarApp ({ basePath, className }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const scheduled = useScheduled();
  const [now, setNow] = useState(new Date());
  const [dateState, setDateState] = useState(getDateState(now, now));

  const itemsRef = useRef([{
    isRoot: true,
    name: 'view',
    text: t<string>('Upcoming events')
  }]);

  useEffect((): () => void => {
    const intervalId = setInterval(() => setNow(new Date()), NOW_INC);

    return (): void => {
      clearInterval(intervalId);
    };
  }, []);

  const [hasNextMonth, hasNextDay, lastDay] = useMemo(
    () => {
      const nextDay = new Date(dateState.dateSelected);

      nextDay.setDate(nextDay.getDate() + 1);

      const nextDayTime = nextDay.getTime();
      const nextMonthTime = dateState.dateMonthNext.getTime();
      const hasNextMonth = scheduled.some(({ dateTime }) => dateTime >= nextMonthTime);
      const hasNextDay = hasNextMonth || scheduled.some(({ dateTime }) => dateTime >= nextDayTime);
      const lastDay = hasNextMonth
        ? 42 // more than days in month
        : scheduled.reduce((lastDay: number, { date }): number => {
          return date.getFullYear() === dateState.dateMonth.getFullYear() && date.getMonth() === dateState.dateMonth.getMonth()
            ? Math.max(lastDay, date.getDate())
            : lastDay;
        }, 0);

      return [hasNextMonth, hasNextDay, lastDay];
    },
    [dateState, scheduled]
  );

  const _nextMonth = useCallback(
    () => setDateState(({ dateMonth, dateSelected }) => getDateState(nextMonth(dateMonth), dateSelected)),
    []
  );

  const _prevMonth = useCallback(
    () => setDateState(({ dateMonth, dateSelected }) => getDateState(prevMonth(dateMonth), dateSelected)),
    []
  );

  const _nextDay = useCallback(
    () => setDateState(({ dateSelected }): DateState => {
      const date = new Date(dateSelected);

      date.setDate(date.getDate() + 1);

      return getDateState(date, date);
    }),
    []
  );

  const _prevDay = useCallback(
    () => setDateState(({ dateSelected }): DateState => {
      const date = new Date(dateSelected);

      date.setDate(date.getDate() - 1);

      return getDateState(date, date);
    }),
    []
  );

  const _setDay = useCallback(
    (day: number) => setDateState(({ dateMonth }): DateState => {
      const date = new Date(dateMonth);

      date.setDate(day);

      return getDateState(date, date);
    }),
    []
  );

  return (
    <main className={className}>
      <header>
        <Tabs
          basePath={basePath}
          items={itemsRef.current}
        />
      </header>
      <div className='calendarFlex'>
        <Day
          date={dateState.dateSelected}
          hasNextDay={hasNextDay}
          now={now}
          scheduled={scheduled}
          setNextDay={_nextDay}
          setPrevDay={_prevDay}
        />
        <Month
          hasNextMonth={hasNextMonth}
          lastDay={lastDay}
          now={now}
          scheduled={scheduled}
          setDay={_setDay}
          setNextMonth={_nextMonth}
          setPrevMonth={_prevMonth}
          state={dateState}
        />
      </div>
    </main>
  );
}

export default React.memo(styled(CalendarApp)`
  .calendarFlex {
    align-items: flex-start;
    display: flex;
    flex-wrap: nowrap;

    > div {
      background-color: #fff;
      border: 1px solid #ddd;
      border-radius: 0.25rem;
    }
  }
`);
