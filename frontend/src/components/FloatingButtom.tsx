import { Fab } from '@mui/material'
import { Add as AddIcon } from '@mui/icons-material'


function FloatingButtom({ setOpenForm }: { setOpenForm: (open: boolean) => void }) {
  return (
    <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 58,
          right: 16,
        }}
        onClick={() => setOpenForm(true)}
      >
        <AddIcon />
    </Fab>
  )
}

export default FloatingButtom