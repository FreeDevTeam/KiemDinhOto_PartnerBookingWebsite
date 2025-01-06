import React, { useState, useEffect } from 'react'

function Countdown(props) {
  const [count, setCount] = useState(props.seconds)
  const [isEnd, setIsEnd] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      const newCount = count - 1
      if (newCount >= 0) {
        setCount(newCount)
      } else {
        clearInterval(interval)
        setIsEnd(true);
      }
    }, 1000)
    if (!count && props.event) props.event()
    return () => clearInterval(interval)
  }, [count])

  const formated = props.formater ? props.formater(count) : count;

  if (isEnd && props.onEnd) {
    return <>{props.onEnd()}</>
  }

  return <div>{formated}</div>
}

export default Countdown
