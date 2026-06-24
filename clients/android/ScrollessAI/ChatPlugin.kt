package com.scrolless.ai

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.compose.viewModel
import kotlinx.coroutines.launch

// Palette sampled from the real scrolless.com hero screenshot:
// dark slate background with a warm peach/amber glow.
object Theme {
    val Dark = Color(0xFF1A1A1D)        // navbar / header
    val Slate = Color(0xFF2E323B)       // panel background
    val SlateLight = Color(0xFF3D424D)  // borders
    val Peach = Color(0xFFD89A6E)       // warm accent
    val PeachDark = Color(0xFFC77B52)   // accent pressed
    val TextC = Color(0xFFF5F2EE)       // light text
    val TextDim = Color(0xFFC9C6C2)     // secondary text
}

class ChatViewModel : ViewModel() {
    val messages = mutableStateListOf(
        ChatMessage("assistant",
            "Hi! I'm Scrolless AI. Ask me about pricing, how the app works, privacy, or troubleshooting. 👋")
    )
    var sending by mutableStateOf(false); private set

    fun send(text: String) {
        val t = text.trim()
        if (t.isEmpty() || sending) return
        messages.add(ChatMessage("user", t))
        sending = true
        viewModelScope.launch {
            try {
                messages.add(ChatMessage("assistant", ChatService.send(messages.toList())))
            } catch (e: Exception) {
                messages.add(ChatMessage("assistant",
                    "Oops, something went wrong. Please try again or email info@scrolless.com."))
            }
            sending = false
        }
    }
}

// The floating action button that opens the chat. Drop this into your
// screen's Box, alongside ChatSheet():
//
//   Box(Modifier.fillMaxSize()) {
//       YourScreenContent()
//       if (!showChat) {
//           ChatButton(onClick = { showChat = true }, modifier = Modifier.align(Alignment.BottomEnd).padding(20.dp))
//       }
//       if (showChat) ChatSheet(onClose = { showChat = false })
//   }
//
// Hiding the button while showChat is true (and showing it again once the
// sheet is dismissed) keeps it from floating behind the chat panel.
@Composable
fun ChatButton(onClick: () -> Unit, modifier: Modifier = Modifier) {
    FloatingActionButton(
        onClick = onClick,
        containerColor = Theme.Dark, contentColor = Theme.Peach,
        modifier = modifier
    ) { Text("💬", fontSize = 22.sp) }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ChatSheet(onClose: () -> Unit, vm: ChatViewModel = viewModel()) {
    ModalBottomSheet(onDismissRequest = onClose, containerColor = Theme.Slate) {
        Column(Modifier.fillMaxWidth().heightIn(min = 480.dp)) {
            // Header
            Row(
                Modifier.fillMaxWidth().background(Theme.Dark).padding(16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(Modifier.size(8.dp).clip(CircleShape).background(Theme.Peach))
                Spacer(Modifier.width(10.dp))
                Column {
                    Text("Scrolless AI", color = Theme.TextC, fontSize = 15.sp)
                    Text("Here to help with your eyes", color = Theme.TextDim, fontSize = 12.sp)
                }
            }

            // Messages
            val scroll = rememberScrollState()
            LaunchedEffect(vm.messages.size) { scroll.animateScrollTo(scroll.maxValue) }
            Column(
                Modifier.weight(1f).fillMaxWidth().verticalScroll(scroll).padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                vm.messages.forEach { Bubble(it) }
                if (vm.sending) Text("…", color = Theme.Peach, fontSize = 22.sp)
            }

            // Input
            var input by remember { mutableStateOf("") }
            Row(
                Modifier.fillMaxWidth().padding(12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                OutlinedTextField(
                    value = input, onValueChange = { input = it },
                    placeholder = { Text("Type your question…", color = Theme.TextDim) },
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(22.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = Theme.TextC, unfocusedTextColor = Theme.TextC,
                        focusedContainerColor = Theme.Dark, unfocusedContainerColor = Theme.Dark,
                        focusedBorderColor = Theme.Peach, unfocusedBorderColor = Theme.SlateLight
                    ),
                    keyboardActions = KeyboardActions(onSend = { vm.send(input); input = "" }),
                    singleLine = true
                )
                Spacer(Modifier.width(8.dp))
                Button(
                    onClick = { vm.send(input); input = "" },
                    enabled = input.isNotBlank() && !vm.sending,
                    colors = ButtonDefaults.buttonColors(containerColor = Theme.Peach),
                    shape = CircleShape, contentPadding = PaddingValues(0.dp),
                    modifier = Modifier.size(48.dp)
                ) { Text("→", fontSize = 18.sp, color = Color.White) }
            }
        }
    }
}

@Composable
fun Bubble(msg: ChatMessage) {
    val isUser = msg.role == "user"
    Row(Modifier.fillMaxWidth(),
        horizontalArrangement = if (isUser) Arrangement.End else Arrangement.Start) {
        Box(
            Modifier
                .widthIn(max = 280.dp)
                .clip(RoundedCornerShape(14.dp))
                .background(if (isUser) Theme.PeachDark else Theme.Dark)
                .padding(horizontal = 13.dp, vertical = 10.dp)
        ) {
            Text(msg.content, color = Color.White, fontSize = 14.sp)
        }
    }
}
