'use client'

import { useLiveQuery } from 'dexie-react-hooks'
import type { Action } from '../../interface/database'
import { getAllActions } from '../../services/dexie/collections/action'

const ActionsManager = () => {
  const actions = (useLiveQuery(async () => getAllActions(), []) as Action[] | undefined) || []

  return (
    <div className='p-4'>
      <h2 className='text-lg font-bold mb-4'>Live Actions</h2>
      {actions.length === 0 ? (
        <p className='text-gray-500'>No active actions</p>
      ) : (
        <div className='space-y-3'>
          {actions.map((action: Action) => (
            <div key={action.id} className='border rounded p-3 bg-green-50'>
              <div className='flex justify-between items-start'>
                <div>
                  <p className='text-xs text-gray-600 mt-1'>{new Date(action.createdAt).toLocaleTimeString()}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${action.isCompleted ? 'bg-green-200' : 'bg-yellow-200'}`}>
                  {action.isCompleted ? 'Done' : 'Pending'}
                </span>
              </div>
              <p className='text-sm mt-2 text-gray-700'>{action.description}</p>
              <p className='text-xs text-gray-500 mt-2'>Priority: {action.priority}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ActionsManager
