package com.scrolless.ai

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
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
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.launch

// Scrolless palette (cream / brown / tan)
object Theme {
    val Cream = Color(0xFFF4F1EA)
    val Brown = Color(0xFF5A4632)
    val Tan = Color(0xFFC8A57E)
    val TextC = Color(0xFF3A2E22)
    val Border = Color(0xFFE2DACB)
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

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { MaterialTheme { DemoHome() } }
    }
}

@Composable
fun DemoHome() {
    var showChat by remember { mutableStateOf(false) }

    Box(Modifier.fillMaxSize().background(Theme.Cream)) {
        // Mock Scrolless home
        Column(
            Modifier.fillMaxSize(), horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Box(Modifier.size(16.dp).clip(CircleShape).background(Theme.Tan))
            Spacer(Modifier.height(12.dp))
            Text("Scrolless", color = Theme.Brown, fontSize = 22.sp)
            Spacer(Modifier.height(10.dp))
            Text("Your digital life, balanced.\nVision protected.",
                color = Theme.TextC, fontSize = 16.sp, textAlign = TextAlign.Center)
        }

        // ▼ Reusable floating chat button (drop this into the real app) ▼
        FloatingActionButton(
            onClick = { showChat = true },
            containerColor = Theme.Brown, contentColor = Theme.Cream,
            modifier = Modifier.align(Alignment.BottomEnd).padding(20.dp)
        ) { Text("💬", fontSize = 22.sp) }
        // ▲

        if (showChat) ChatSheet(onClose = { showChat = false })
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ChatSheet(onClose: () -> Unit, vm: ChatViewModel = viewModel()) {
    ModalBottomSheet(onDismissRequest = onClose, containerColor = Theme.Cream) {
        Column(Modifier.fillMaxWidth().heightIn(min = 480.dp)) {
            // Header
            Row(
                Modifier.fillMaxWidth().background(Theme.Brown).padding(16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(Modifier.size(8.dp).clip(CircleShape).background(Theme.Tan))
                Spacer(Modifier.width(10.dp))
                Column {
                    Text("Scrolless AI", color = Theme.Cream, fontSize = 15.sp)
                    Text("Here to help with your eyes", color = Theme.Cream, fontSize = 12.sp)
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
                if (vm.sending) Text("…", color = Theme.Tan, fontSize = 22.sp)
            }

            // Input
            var input by remember { mutableStateOf("") }
            Row(
                Modifier.fillMaxWidth().padding(12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                OutlinedTextField(
                    value = input, onValueChange = { input = it },
                    placeholder = { Text("Type your question…") },
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(22.dp),
                    keyboardActions = KeyboardActions(onSend = { vm.send(input); input = "" }),
                    singleLine = true
                )
                Spacer(Modifier.width(8.dp))
                Button(
                    onClick = { vm.send(input); input = "" },
                    enabled = input.isNotBlank() && !vm.sending,
                    colors = ButtonDefaults.buttonColors(containerColor = Theme.Tan),
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
                .background(if (isUser) Theme.Brown else Color.White)
                .padding(horizontal = 13.dp, vertical = 10.dp)
        ) {
            Text(msg.content, color = if (isUser) Theme.Cream else Theme.TextC, fontSize = 14.sp)
        }
    }
}
